var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Mutex, withTimeout } from 'async-mutex';
import { Gatt, GattError } from '../../../models';
import * as CONST from './Constants';
import { HciGattCharacteristic } from './Characteristic';
import { HciGattDescriptor } from './Descriptor';
import { HciGattService } from './Service';
const GATT_CMD_TIMEOUT = 20000; // in milliseconds
export class HciGattRemote extends Gatt {
    constructor(peripheral, hci, handle, cmdTimeout = GATT_CMD_TIMEOUT) {
        super(peripheral, null);
        this.currentCmd = null;
        this.services = new Map();
        this.onAclStreamData = (handle, cid, data) => {
            if (handle !== this.handle || cid !== CONST.ATT_CID) {
                return;
            }
            if (this.currentCmd && data.toString('hex') === this.currentCmd.buffer.toString('hex')) {
                // NO-OP
                // This is just a confirmation for the command we just sent?
            }
            else if (data[0] % 2 === 0) {
                // Invalid request, reply with an error
                const requestType = data[0];
                this.queueCommand(this.errorResponse(requestType, 0x0000, CONST.ATT_ECODE_REQ_NOT_SUPP), true).catch(() => null);
            }
            else if (data[0] === CONST.ATT_OP_HANDLE_NOTIFY || data[0] === CONST.ATT_OP_HANDLE_IND) {
                const valueHandle = data.readUInt16LE(1);
                const valueData = data.slice(3);
                // this.emit('handleNotify', valueHandle, valueData);
                if (data[0] === CONST.ATT_OP_HANDLE_IND) {
                    // TODO: Possibly a proper error handling is required here?
                    this.handleConfirmation().catch(() => null);
                    // this.emit('handleConfirmation', valueHandle);
                }
                for (const service of this.services.values()) {
                    for (const characteristic of service.characteristics.values()) {
                        if (characteristic.valueHandle === valueHandle) {
                            characteristic.emit('notification', valueData);
                        }
                    }
                }
            }
            else if (!this.currentCmd) {
                // NO-OP
            }
            else {
                if (data[0] === CONST.ATT_OP_ERROR &&
                    (data[4] === CONST.ATT_ECODE_AUTHENTICATION ||
                        data[4] === CONST.ATT_ECODE_AUTHORIZATION ||
                        data[4] === CONST.ATT_ECODE_INSUFF_ENC) &&
                    this.security !== 'medium') {
                    // this.aclStream.encrypt();
                    return;
                }
                this.currentCmd.onResponse(data);
            }
        };
        this.handle = handle;
        this.hci = hci;
        this.hci.on('aclDataPkt', this.onAclStreamData);
        this.cmdTimeout = cmdTimeout;
        this.mutex = withTimeout(new Mutex(), this.cmdTimeout, new GattError(peripheral, 'GATT command mutex timeout'));
        this.currentCmd = null;
        this.mtuWasExchanged = false;
    }
    acquireMutex() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const release = yield this.mutex.acquire();
                this.mutexStack = new Error();
                return release;
            }
            catch (_b) {
                throw new GattError(this.peripheral, `Could not acquire GATT command mutex`, (_a = this.mutexStack) === null || _a === void 0 ? void 0 : _a.stack);
            }
        });
    }
    dispose(reason) {
        this.disposeReason = reason;
        // First dispose hci so no further commands are processed
        if (this.hci) {
            this.hci.off('aclDataPkt', this.onAclStreamData);
            this.hci = null;
        }
        // Then cancel the current command
        if (this.currentCmd) {
            this.currentCmd.onResponse(null, reason || 'GATT disposed');
            this.currentCmd = null;
        }
        // Then cancel any commands waiting for the mutex
        this.mutex.cancel();
        // At last throw the handle away
        this.handle = null;
    }
    errorResponse(opcode, handle, status) {
        const buf = Buffer.alloc(5);
        buf.writeUInt8(CONST.ATT_OP_ERROR, 0);
        buf.writeUInt8(opcode, 1);
        buf.writeUInt16LE(handle, 2);
        buf.writeUInt8(status, 4);
        return buf;
    }
    queueCommand(buffer, resolveOnWrite) {
        return __awaiter(this, void 0, void 0, function* () {
            // If we don't have an hci anymore exit now
            if (!this.hci) {
                throw new GattError(this.peripheral, `GATT already disposed`, this.disposeReason);
            }
            const release = yield this.acquireMutex();
            // The hci might have been disposed while we were waiting for the mutex
            if (!this.hci) {
                release();
                throw new GattError(this.peripheral, `GATT already disposed`, this.disposeReason);
            }
            // Create the error outside the promise to preserve the stack trace
            const gattError = new GattError(this.peripheral, 'GATT Error'); // Actual error will be appended
            const timeoutError = new GattError(this.peripheral, 'GATT command timed out');
            return new Promise((resolve, reject) => {
                let isDone = false;
                const onTimeout = () => {
                    if (isDone) {
                        return;
                    }
                    isDone = true;
                    this.currentCmd = null;
                    release();
                    reject(timeoutError);
                };
                const onDone = (data, error) => {
                    if (isDone) {
                        return;
                    }
                    isDone = true;
                    this.currentCmd = null;
                    release();
                    if (data === null) {
                        gattError.details = error;
                        gattError.stack = new Error().stack + '\n' + gattError.stack;
                        reject(gattError);
                    }
                    else {
                        resolve(data);
                    }
                };
                this.currentCmd = {
                    buffer: buffer,
                    onResponse: onDone
                };
                this.hci.writeAclDataPkt(this.handle, CONST.ATT_CID, buffer);
                setTimeout(onTimeout, this.cmdTimeout);
                if (resolveOnWrite) {
                    onDone();
                }
            });
        });
    }
    mtuRequest(mtu) {
        const buf = Buffer.alloc(3);
        buf.writeUInt8(CONST.ATT_OP_MTU_REQ, 0);
        buf.writeUInt16LE(mtu, 1);
        return this.queueCommand(buf, false);
    }
    readByGroupRequest(startHandle, endHandle, groupUUID) {
        const buf = Buffer.alloc(7);
        buf.writeUInt8(CONST.ATT_OP_READ_BY_GROUP_REQ, 0);
        buf.writeUInt16LE(startHandle, 1);
        buf.writeUInt16LE(endHandle, 3);
        buf.writeUInt16LE(groupUUID, 5);
        return this.queueCommand(buf, false);
    }
    readByTypeRequest(startHandle, endHandle, groupUUID) {
        const buf = Buffer.alloc(7);
        buf.writeUInt8(CONST.ATT_OP_READ_BY_TYPE_REQ, 0);
        buf.writeUInt16LE(startHandle, 1);
        buf.writeUInt16LE(endHandle, 3);
        buf.writeUInt16LE(groupUUID, 5);
        return this.queueCommand(buf, false);
    }
    readRequest(handle) {
        const buf = Buffer.alloc(3);
        buf.writeUInt8(CONST.ATT_OP_READ_REQ, 0);
        buf.writeUInt16LE(handle, 1);
        return this.queueCommand(buf, false);
    }
    readBlobRequest(handle, offset) {
        const buf = Buffer.alloc(5);
        buf.writeUInt8(CONST.ATT_OP_READ_BLOB_REQ, 0);
        buf.writeUInt16LE(handle, 1);
        buf.writeUInt16LE(offset, 3);
        return this.queueCommand(buf, false);
    }
    findInfoRequest(startHandle, endHandle) {
        const buf = Buffer.alloc(5);
        buf.writeUInt8(CONST.ATT_OP_FIND_INFO_REQ, 0);
        buf.writeUInt16LE(startHandle, 1);
        buf.writeUInt16LE(endHandle, 3);
        return this.queueCommand(buf, false);
    }
    writeRequest(handle, data, withoutResponse) {
        const buf = Buffer.alloc(3 + data.length);
        buf.writeUInt8(withoutResponse ? CONST.ATT_OP_WRITE_CMD : CONST.ATT_OP_WRITE_REQ, 0);
        buf.writeUInt16LE(handle, 1);
        for (let i = 0; i < data.length; i++) {
            buf.writeUInt8(data.readUInt8(i), i + 3);
        }
        if (withoutResponse) {
            return this.queueCommand(buf, true);
        }
        else {
            return this.queueCommand(buf, false);
        }
    }
    prepareWriteRequest(handle, offset, data) {
        const buf = Buffer.alloc(5 + data.length);
        buf.writeUInt8(CONST.ATT_OP_PREPARE_WRITE_REQ, 0);
        buf.writeUInt16LE(handle, 1);
        buf.writeUInt16LE(offset, 3);
        for (let i = 0; i < data.length; i++) {
            buf.writeUInt8(data.readUInt8(i), i + 5);
        }
        return this.queueCommand(buf, false);
    }
    executeWriteRequest(handle, cancelPreparedWrites) {
        const buf = Buffer.alloc(2);
        buf.writeUInt8(CONST.ATT_OP_EXECUTE_WRITE_REQ, 0);
        buf.writeUInt8(cancelPreparedWrites ? 0 : 1, 1);
        return this.queueCommand(buf, false);
    }
    handleConfirmation() {
        const buf = Buffer.alloc(1);
        buf.writeUInt8(CONST.ATT_OP_HANDLE_CNF, 0);
        return this.queueCommand(buf, true);
    }
    exchangeMtu(mtu) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.mtuWasExchanged) {
                return this.mtu;
            }
            const data = yield this.mtuRequest(mtu);
            const opcode = data[0];
            if (opcode === CONST.ATT_OP_MTU_RESP) {
                const newMtu = data.readUInt16LE(1);
                this._mtu = Math.min(mtu, newMtu);
                this.mtuWasExchanged = true;
            }
            else {
                throw new GattError(this.peripheral, 'Exchanging mtu failed');
            }
            return this.mtu;
        });
    }
    doDiscoverServices() {
        return __awaiter(this, void 0, void 0, function* () {
            const newServices = [];
            let startHandle = 0x0001;
            const run = true;
            while (run) {
                const data = yield this.readByGroupRequest(startHandle, 0xffff, CONST.GATT_PRIM_SVC_UUID);
                const opcode = data[0];
                if (opcode === CONST.ATT_OP_READ_BY_GROUP_RESP) {
                    const type = data[1];
                    const num = (data.length - 2) / type;
                    for (let i = 0; i < num; i++) {
                        const offset = 2 + i * type;
                        const srvStartHandle = data.readUInt16LE(offset);
                        const srvEndHandle = data.readUInt16LE(offset + 2);
                        const uuid = type === 6
                            ? data.readUInt16LE(offset + 4).toString(16)
                            : data
                                .slice(offset + 4)
                                .slice(0, 16)
                                .toString('hex')
                                .match(/.{1,2}/g)
                                .reverse()
                                .join('');
                        const newService = new HciGattService(this, uuid, true, srvStartHandle, srvEndHandle);
                        newServices.push(newService);
                    }
                }
                if (opcode !== CONST.ATT_OP_READ_BY_GROUP_RESP || newServices[newServices.length - 1].endHandle === 0xffff) {
                    break;
                }
                else {
                    startHandle = newServices[newServices.length - 1].endHandle + 1;
                }
            }
            return newServices;
        });
    }
    discoverCharacteristics(serviceUUID) {
        return __awaiter(this, void 0, void 0, function* () {
            const service = this.services.get(serviceUUID);
            if (!service) {
                throw new GattError(this.peripheral, `Service ${serviceUUID} not found`);
            }
            const newChars = [];
            let startHandle = service.startHandle;
            const run = true;
            while (run) {
                const data = yield this.readByTypeRequest(startHandle, service.endHandle, CONST.GATT_CHARAC_UUID);
                const opcode = data[0];
                if (opcode === CONST.ATT_OP_READ_BY_TYPE_RESP) {
                    const type = data[1];
                    const num = (data.length - 2) / type;
                    for (let i = 0; i < num; i++) {
                        const offset = 2 + i * type;
                        const charStartHandle = data.readUInt16LE(offset);
                        const secureFlag = data.readUInt8(offset + 1);
                        const propertiesFlag = data.readUInt8(offset + 2);
                        const charValueHandle = data.readUInt16LE(offset + 3);
                        const uuid = type === 7
                            ? data.readUInt16LE(offset + 5).toString(16)
                            : data
                                .slice(offset + 5)
                                .slice(0, 16)
                                .toString('hex')
                                .match(/.{1,2}/g)
                                .reverse()
                                .join('');
                        const newChar = new HciGattCharacteristic(service, uuid, true, propertiesFlag, secureFlag, charStartHandle, charValueHandle);
                        newChars.push(newChar);
                    }
                }
                if (opcode !== CONST.ATT_OP_READ_BY_TYPE_RESP ||
                    newChars[newChars.length - 1].valueHandle === service.endHandle) {
                    break;
                }
                else {
                    startHandle = newChars[newChars.length - 1].valueHandle + 1;
                }
            }
            // Add end handle to all characteristics
            for (let i = 0; i < newChars.length; i++) {
                const characteristic = newChars[i];
                if (i !== 0) {
                    newChars[i - 1].endHandle = newChars[i].startHandle - 1;
                }
                if (i === newChars.length - 1) {
                    characteristic.endHandle = service.endHandle;
                }
            }
            return newChars;
        });
    }
    readCharacteristic(serviceUUID, characteristicUUID) {
        return __awaiter(this, void 0, void 0, function* () {
            const service = this.services.get(serviceUUID);
            if (!service) {
                throw new GattError(this.peripheral, `Service ${serviceUUID} not found`);
            }
            const characteristic = service.characteristics.get(characteristicUUID);
            if (!characteristic) {
                throw new GattError(this.peripheral, `Characteristic ${characteristicUUID} in service ${serviceUUID} not found`);
            }
            let readData = Buffer.alloc(0);
            let data = yield this.readRequest(characteristic.valueHandle);
            let opcode = data[0];
            const run = true;
            while (run) {
                if (opcode !== CONST.ATT_OP_READ_RESP && opcode !== CONST.ATT_OP_READ_BLOB_RESP) {
                    return readData;
                }
                readData = Buffer.concat([readData, data.slice(1)], readData.length + data.length - 1);
                if (data.length !== this.mtu) {
                    return readData;
                }
                data = yield this.readBlobRequest(characteristic.valueHandle, readData.length);
                opcode = data[0];
            }
        });
    }
    writeCharacteristic(serviceUUID, characteristicUUID, data, withoutResponse) {
        return __awaiter(this, void 0, void 0, function* () {
            const service = this.services.get(serviceUUID);
            if (!service) {
                throw new GattError(this.peripheral, `Service ${serviceUUID} not found`);
            }
            const characteristic = service.characteristics.get(characteristicUUID);
            if (!characteristic) {
                throw new GattError(this.peripheral, `Characteristic ${characteristicUUID} in service ${serviceUUID} not found`);
            }
            if (withoutResponse) {
                yield this.writeRequest(characteristic.valueHandle, data, true);
            }
            else if (data.length + 3 > this.mtu) {
                return this.longWrite(serviceUUID, characteristicUUID, data, withoutResponse);
            }
            else {
                const respData = yield this.writeRequest(characteristic.valueHandle, data, false);
                const opcode = respData[0];
                if (opcode !== CONST.ATT_OP_WRITE_RESP) {
                    throw new GattError(this.peripheral, `Write error, opcode ${opcode}`);
                }
            }
        });
    }
    /* Perform a "long write" as described Bluetooth Spec section 4.9.4 "Write Long Characteristic Values" */
    longWrite(serviceUUID, characteristicUUID, data, withoutResponse) {
        return __awaiter(this, void 0, void 0, function* () {
            const service = this.services.get(serviceUUID);
            if (!service) {
                throw new GattError(this.peripheral, `Service ${serviceUUID} not found`);
            }
            const characteristic = service.characteristics.get(characteristicUUID);
            if (!characteristic) {
                throw new GattError(this.peripheral, `Characteristic ${characteristicUUID} in service ${serviceUUID} not found`);
            }
            const limit = this.mtu - 5;
            /* split into prepare-write chunks and queue them */
            let offset = 0;
            while (offset < data.length) {
                const end = offset + limit;
                const chunk = data.slice(offset, end);
                const chunkRespData = yield this.prepareWriteRequest(characteristic.valueHandle, offset, chunk);
                const chunkOpcode = chunkRespData[0];
                if (chunkOpcode !== CONST.ATT_OP_PREPARE_WRITE_RESP) {
                    throw new GattError(this.peripheral, `Long write chunk failed, invalid opcode ${chunkOpcode}`);
                }
                else {
                    const expectedLength = chunk.length + 5;
                    if (chunkRespData.length !== expectedLength) {
                        /* the response should contain the data packet echoed back to the caller */
                        throw new GattError(this.peripheral, `Long write chunk failed, received invalid response length`);
                    }
                }
                offset = end;
            }
            /* queue the execute command with a callback to emit the write signal when done */
            const respData = yield this.executeWriteRequest(characteristic.valueHandle);
            const opcode = respData[0];
            if (opcode !== CONST.ATT_OP_EXECUTE_WRITE_RESP && !withoutResponse) {
                throw new GattError(this.peripheral, `Long write failed, invalid opcode ${opcode}`);
            }
        });
    }
    broadcastCharacteristic(serviceUUID, characteristicUUID, broadcast) {
        return __awaiter(this, void 0, void 0, function* () {
            const service = this.services.get(serviceUUID);
            if (!service) {
                throw new GattError(this.peripheral, `Service ${serviceUUID} not found`);
            }
            const characteristic = service.characteristics.get(characteristicUUID);
            if (!characteristic) {
                throw new GattError(this.peripheral, `Characteristic ${characteristicUUID} in service ${serviceUUID} not found`);
            }
            const data = yield this.readByTypeRequest(characteristic.startHandle, characteristic.endHandle, CONST.GATT_SERVER_CHARAC_CFG_UUID);
            const opcode = data[0];
            if (opcode !== CONST.ATT_OP_READ_BY_TYPE_RESP) {
                throw new GattError(this.peripheral, `Broadcast error, opcode ${opcode}`);
            }
            const handle = data.readUInt16LE(2);
            let value = data.readUInt16LE(4);
            // tslint:disable: no-bitwise
            if (broadcast) {
                value |= 0x0001;
            }
            else {
                value &= 0xfffe;
            }
            // tslint:enable: no-bitwise
            const valueBuffer = Buffer.alloc(2);
            valueBuffer.writeUInt16LE(value, 0);
            const moreData = yield this.writeRequest(handle, valueBuffer, false);
            const moreOpcode = moreData[0];
            if (moreOpcode !== CONST.ATT_OP_WRITE_RESP) {
                throw new GattError(this.peripheral, `Broadcast error, opcode ${opcode}`);
            }
        });
    }
    notifyCharacteristic(serviceUUID, characteristicUUID, notify) {
        return __awaiter(this, void 0, void 0, function* () {
            const service = this.services.get(serviceUUID);
            if (!service) {
                throw new GattError(this.peripheral, `Service ${serviceUUID} not found`);
            }
            const characteristic = service.characteristics.get(characteristicUUID);
            if (!characteristic) {
                throw new GattError(this.peripheral, `Characteristic ${characteristicUUID} in service ${serviceUUID} not found`);
            }
            const data = yield this.readByTypeRequest(characteristic.startHandle, characteristic.endHandle, CONST.GATT_CLIENT_CHARAC_CFG_UUID);
            const opcode = data[0];
            if (opcode === CONST.ATT_OP_READ_BY_TYPE_RESP) {
                const handle = data.readUInt16LE(2);
                let value = data.readUInt16LE(4);
                const useNotify = characteristic.properties.includes('notify');
                const useIndicate = characteristic.properties.includes('indicate');
                // tslint:disable: no-bitwise
                if (notify) {
                    if (useNotify) {
                        value |= 0x0001;
                    }
                    else if (useIndicate) {
                        value |= 0x0002;
                    }
                }
                else {
                    if (useNotify) {
                        value &= 0xfffe;
                    }
                    else if (useIndicate) {
                        value &= 0xfffd;
                    }
                }
                // tslint:enable: no-bitwise
                const valueBuffer = Buffer.alloc(2);
                valueBuffer.writeUInt16LE(value, 0);
                const moreData = yield this.writeRequest(handle, valueBuffer, false);
                const moreOpcode = moreData[0];
                if (moreOpcode !== CONST.ATT_OP_WRITE_RESP) {
                    throw new GattError(this.peripheral, `Notify error, opcode ${opcode}`);
                }
            }
        });
    }
    discoverDescriptors(serviceUUID, characteristicUUID) {
        return __awaiter(this, void 0, void 0, function* () {
            const service = this.services.get(serviceUUID);
            if (!service) {
                throw new GattError(this.peripheral, `Service ${serviceUUID} not found`);
            }
            const characteristic = service.characteristics.get(characteristicUUID);
            if (!characteristic) {
                throw new GattError(this.peripheral, `Characteristic ${characteristicUUID} in service ${serviceUUID} not found`);
            }
            const newDescs = [];
            let startHandle = characteristic.valueHandle + 1;
            const run = true;
            while (run) {
                const data = yield this.findInfoRequest(startHandle, characteristic.endHandle);
                const opcode = data[0];
                if (opcode === CONST.ATT_OP_FIND_INFO_RESP) {
                    const num = data[1];
                    for (let i = 0; i < num; i++) {
                        const descHandle = data.readUInt16LE(2 + i * 4 + 0);
                        const uuid = data.readUInt16LE(2 + i * 4 + 2).toString(16);
                        const newDescriptor = new HciGattDescriptor(characteristic, uuid, true, descHandle);
                        newDescs.push(newDescriptor);
                    }
                }
                if (opcode !== CONST.ATT_OP_FIND_INFO_RESP || newDescs[newDescs.length - 1].handle === characteristic.endHandle) {
                    break;
                }
                else {
                    startHandle = newDescs[newDescs.length - 1].handle + 1;
                }
            }
            return newDescs;
        });
    }
    readDescriptor(serviceUUID, characteristicUUID, descriptorUUID) {
        return __awaiter(this, void 0, void 0, function* () {
            const service = this.services.get(serviceUUID);
            if (!service) {
                throw new GattError(this.peripheral, `Service ${serviceUUID} not found`);
            }
            const characteristic = service.characteristics.get(characteristicUUID);
            if (!characteristic) {
                throw new GattError(this.peripheral, `Characteristic ${characteristicUUID} in service ${serviceUUID} not found`);
            }
            const descriptor = characteristic.descriptors.get(descriptorUUID);
            if (!descriptor) {
                throw new GattError(this.peripheral, `Descriptor ${descriptorUUID} in characteristic ${characteristicUUID} in service ${serviceUUID} not found`);
            }
            let readData = Buffer.alloc(0);
            let data = yield this.readRequest(descriptor.handle);
            let opcode = data[0];
            const run = true;
            while (run) {
                if (opcode !== CONST.ATT_OP_READ_RESP && opcode !== CONST.ATT_OP_READ_BLOB_RESP) {
                    return readData;
                }
                readData = Buffer.concat([readData, data.slice(1)]);
                if (data.length !== this.mtu) {
                    return readData;
                }
                data = yield this.readBlobRequest(descriptor.handle, readData.length);
                opcode = data[0];
            }
        });
    }
    writeDescriptor(serviceUUID, characteristicUUID, descriptorUUID, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const service = this.services.get(serviceUUID);
            if (!service) {
                throw new GattError(this.peripheral, `Service ${serviceUUID} not found`);
            }
            const characteristic = service.characteristics.get(characteristicUUID);
            if (!characteristic) {
                throw new GattError(this.peripheral, `Characteristic ${characteristicUUID} in service ${serviceUUID} not found`);
            }
            const descriptor = characteristic.descriptors.get(descriptorUUID);
            if (!descriptor) {
                throw new GattError(this.peripheral, `Descriptor ${descriptorUUID} in characteristic ${characteristicUUID} in service ${serviceUUID} not found`);
            }
            const respData = yield this.writeRequest(descriptor.handle, data, false);
            const opcode = respData[0];
            if (opcode !== CONST.ATT_OP_WRITE_RESP) {
                throw new GattError(this.peripheral, `WriteValue error, opcode ${opcode}`);
            }
        });
    }
}
//# sourceMappingURL=GattRemote.js.map