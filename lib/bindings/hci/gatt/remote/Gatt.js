"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HciGattRemote = void 0;
const async_mutex_1 = require("async-mutex");
const models_1 = require("../../../../models");
const CONST = __importStar(require("../Constants"));
const Characteristic_1 = require("./Characteristic");
const Descriptor_1 = require("./Descriptor");
const Service_1 = require("./Service");
class HciGattRemote extends models_1.GattRemote {
    constructor(peripheral, hci, handle) {
        super(peripheral);
        this.mtuWasExchanged = false;
        this.currentCommand = null;
        this.services = new Map();
        this.onHciStateChange = async (newState) => {
            // If the underlaying socket shuts down we're doomed
            if (newState === 'poweredOff') {
                if (this.currentCommand) {
                    this.currentCommand.onResponse(null);
                    this.currentCommand = null;
                }
            }
        };
        this.onAclStreamData = async (handle, cid, data) => {
            if (handle !== this.handle || cid !== CONST.ATT_CID) {
                return;
            }
            if (this.currentCommand && data.toString('hex') === this.currentCommand.buffer.toString('hex')) {
                // NO-OP
                // This is just a confirmation for the command we just sent?
            }
            else if (data[0] % 2 === 0) {
                // NO-OP
                // This used to be noble multi role stuff - these are all commands meant for a central node
            }
            else if (data[0] === CONST.ATT_OP_HANDLE_NOTIFY || data[0] === CONST.ATT_OP_HANDLE_IND) {
                /*const valueHandle = data.readUInt16LE(1);
                const valueData = data.slice(3);
    
                // this.emit('handleNotify', valueHandle, valueData);*/
                if (data[0] === CONST.ATT_OP_HANDLE_IND) {
                    await this.queueCommand(this.handleConfirmation(), true);
                    // this.emit('handleConfirmation', valueHandle);
                }
                /*for (const serviceUuid of this.services.keys()) {
                    for (const characteristicUuid in this.characteristics.get(serviceUuid).keys()) {
                        if (this.characteristics.get(serviceUuid).get(characteristicUuid).valueHandle === valueHandle) {
                            this.emit('notification', serviceUuid, characteristicUuid, valueData);
                        }
                    }
                }*/
            }
            else if (!this.currentCommand) {
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
                this.currentCommand.onResponse(data);
            }
        };
        this.hci = hci;
        this.hci.on('aclDataPkt', this.onAclStreamData);
        this.hci.on('stateChange', this.onHciStateChange);
        this.mutex = async_mutex_1.withTimeout(new async_mutex_1.Mutex(), 10000, new Error(`GATT command mutex timeout`));
        this.handle = handle;
    }
    dispose() {
        if (this.currentCommand) {
            this.currentCommand.onResponse(null);
            this.currentCommand = null;
        }
        this.hci.off('aclDataPkt', this.onAclStreamData);
        this.hci.off('stateChange', this.onHciStateChange);
        this.hci = null;
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
    async queueCommand(buffer, resolveOnWrite) {
        const release = await this.mutex.acquire();
        // We might have been waiting for the mutex and now we're already disposed
        if (!this.hci) {
            return;
        }
        // Create the error outside the promise to preserve the stack trace
        const gattError = new Error(`GATT disposed before receiving response.`);
        return new Promise((resolve, reject) => {
            const onDone = (data) => {
                this.currentCommand = null;
                release();
                if (data === null) {
                    reject(gattError);
                }
                else {
                    resolve(data);
                }
            };
            this.currentCommand = {
                buffer: buffer,
                onResponse: onDone
            };
            this.hci.writeAclDataPkt(this.handle, CONST.ATT_CID, buffer);
            if (resolveOnWrite) {
                onDone();
            }
        });
    }
    mtuRequest(mtu) {
        const buf = Buffer.alloc(3);
        buf.writeUInt8(CONST.ATT_OP_MTU_REQ, 0);
        buf.writeUInt16LE(mtu, 1);
        return buf;
    }
    readByGroupRequest(startHandle, endHandle, groupUUID) {
        const buf = Buffer.alloc(7);
        buf.writeUInt8(CONST.ATT_OP_READ_BY_GROUP_REQ, 0);
        buf.writeUInt16LE(startHandle, 1);
        buf.writeUInt16LE(endHandle, 3);
        buf.writeUInt16LE(groupUUID, 5);
        return buf;
    }
    readByTypeRequest(startHandle, endHandle, groupUUID) {
        const buf = Buffer.alloc(7);
        buf.writeUInt8(CONST.ATT_OP_READ_BY_TYPE_REQ, 0);
        buf.writeUInt16LE(startHandle, 1);
        buf.writeUInt16LE(endHandle, 3);
        buf.writeUInt16LE(groupUUID, 5);
        return buf;
    }
    readRequest(handle) {
        const buf = Buffer.alloc(3);
        buf.writeUInt8(CONST.ATT_OP_READ_REQ, 0);
        buf.writeUInt16LE(handle, 1);
        return buf;
    }
    readBlobRequest(handle, offset) {
        const buf = Buffer.alloc(5);
        buf.writeUInt8(CONST.ATT_OP_READ_BLOB_REQ, 0);
        buf.writeUInt16LE(handle, 1);
        buf.writeUInt16LE(offset, 3);
        return buf;
    }
    findInfoRequest(startHandle, endHandle) {
        const buf = Buffer.alloc(5);
        buf.writeUInt8(CONST.ATT_OP_FIND_INFO_REQ, 0);
        buf.writeUInt16LE(startHandle, 1);
        buf.writeUInt16LE(endHandle, 3);
        return buf;
    }
    writeRequest(handle, data, withoutResponse) {
        const buf = Buffer.alloc(3 + data.length);
        buf.writeUInt8(withoutResponse ? CONST.ATT_OP_WRITE_CMD : CONST.ATT_OP_WRITE_REQ, 0);
        buf.writeUInt16LE(handle, 1);
        for (let i = 0; i < data.length; i++) {
            buf.writeUInt8(data.readUInt8(i), i + 3);
        }
        return buf;
    }
    prepareWriteRequest(handle, offset, data) {
        const buf = Buffer.alloc(5 + data.length);
        buf.writeUInt8(CONST.ATT_OP_PREPARE_WRITE_REQ, 0);
        buf.writeUInt16LE(handle, 1);
        buf.writeUInt16LE(offset, 3);
        for (let i = 0; i < data.length; i++) {
            buf.writeUInt8(data.readUInt8(i), i + 5);
        }
        return buf;
    }
    executeWriteRequest(handle, cancelPreparedWrites) {
        const buf = Buffer.alloc(2);
        buf.writeUInt8(CONST.ATT_OP_EXECUTE_WRITE_REQ, 0);
        buf.writeUInt8(cancelPreparedWrites ? 0 : 1, 1);
        return buf;
    }
    handleConfirmation() {
        const buf = Buffer.alloc(1);
        buf.writeUInt8(CONST.ATT_OP_HANDLE_CNF, 0);
        return buf;
    }
    async exchangeMtu(mtu) {
        if (this.mtuWasExchanged) {
            return this.mtu;
        }
        const data = await this.queueCommand(this.mtuRequest(mtu), false);
        const opcode = data[0];
        if (opcode === CONST.ATT_OP_MTU_RESP) {
            const newMtu = data.readUInt16LE(1);
            this._mtu = Math.min(mtu, newMtu);
            this.mtuWasExchanged = true;
        }
        else {
            throw new Error('Exchanging mtu failed');
        }
        return this.mtu;
    }
    async doDiscoverServices() {
        const newServices = [];
        let startHandle = 0x0001;
        while (true) {
            const data = await this.queueCommand(this.readByGroupRequest(startHandle, 0xffff, CONST.GATT_PRIM_SVC_UUID), false);
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
                    const newService = new Service_1.HciGattServiceRemote(this, uuid, srvStartHandle, srvEndHandle);
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
    }
    async discoverCharacteristics(serviceUUID) {
        const service = this.services.get(serviceUUID);
        if (!service) {
            throw new Error(`Service ${serviceUUID} not found`);
        }
        const newChars = [];
        let startHandle = service.startHandle;
        while (true) {
            const data = await this.queueCommand(this.readByTypeRequest(startHandle, service.endHandle, CONST.GATT_CHARAC_UUID), false);
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
                    const newChar = new Characteristic_1.HciGattCharacteristicRemote(service, uuid, propertiesFlag, secureFlag, charStartHandle, charValueHandle);
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
    }
    async read(serviceUUID, characteristicUUID) {
        const service = this.services.get(serviceUUID);
        if (!service) {
            throw new Error(`Service ${serviceUUID} not found`);
        }
        const characteristic = service.characteristics.get(characteristicUUID);
        if (!characteristic) {
            throw new Error(`Characteristic ${characteristicUUID} in service ${serviceUUID} not found`);
        }
        let readData = Buffer.alloc(0);
        let data = await this.queueCommand(this.readRequest(characteristic.valueHandle), false);
        let opcode = data[0];
        while (true) {
            if (opcode !== CONST.ATT_OP_READ_RESP && opcode !== CONST.ATT_OP_READ_BLOB_RESP) {
                return readData;
            }
            readData = Buffer.concat([readData, data.slice(1)], readData.length + data.length - 1);
            if (data.length !== this.mtu) {
                return readData;
            }
            data = await this.queueCommand(this.readBlobRequest(characteristic.valueHandle, readData.length), false);
            opcode = data[0];
        }
    }
    async write(serviceUUID, characteristicUUID, data, withoutResponse) {
        const service = this.services.get(serviceUUID);
        if (!service) {
            throw new Error(`Service ${serviceUUID} not found`);
        }
        const characteristic = service.characteristics.get(characteristicUUID);
        if (!characteristic) {
            throw new Error(`Characteristic ${characteristicUUID} in service ${serviceUUID} not found`);
        }
        if (withoutResponse) {
            await this.queueCommand(this.writeRequest(characteristic.valueHandle, data, true), true);
        }
        else if (data.length + 3 > this.mtu) {
            return this.longWrite(serviceUUID, characteristicUUID, data, withoutResponse);
        }
        else {
            const respData = await this.queueCommand(this.writeRequest(characteristic.valueHandle, data, false), false);
            const opcode = respData[0];
            if (opcode !== CONST.ATT_OP_WRITE_RESP) {
                throw new Error(`Write error, opcode ${opcode}`);
            }
        }
    }
    /* Perform a "long write" as described Bluetooth Spec section 4.9.4 "Write Long Characteristic Values" */
    async longWrite(serviceUUID, characteristicUUID, data, withoutResponse) {
        const service = this.services.get(serviceUUID);
        if (!service) {
            throw new Error(`Service ${serviceUUID} not found`);
        }
        const characteristic = service.characteristics.get(characteristicUUID);
        if (!characteristic) {
            throw new Error(`Characteristic ${characteristicUUID} in service ${serviceUUID} not found`);
        }
        const limit = this.mtu - 5;
        /* split into prepare-write chunks and queue them */
        let offset = 0;
        while (offset < data.length) {
            const end = offset + limit;
            const chunk = data.slice(offset, end);
            const chunkRespData = await this.queueCommand(this.prepareWriteRequest(characteristic.valueHandle, offset, chunk), false);
            const chunkOpcode = chunkRespData[0];
            if (chunkOpcode !== CONST.ATT_OP_PREPARE_WRITE_RESP) {
                throw new Error(`Long write chunk failed, invalid opcode ${chunkOpcode}`);
            }
            else {
                const expectedLength = chunk.length + 5;
                if (chunkRespData.length !== expectedLength) {
                    /* the response should contain the data packet echoed back to the caller */
                    throw new Error(`Long write chunk failed, received invalid response length`);
                }
            }
            offset = end;
        }
        /* queue the execute command with a callback to emit the write signal when done */
        const respData = await this.queueCommand(this.executeWriteRequest(characteristic.valueHandle), false);
        const opcode = respData[0];
        if (opcode !== CONST.ATT_OP_EXECUTE_WRITE_RESP && !withoutResponse) {
            throw new Error(`Long write failed, invalid opcode ${opcode}`);
        }
    }
    async broadcast(serviceUUID, characteristicUUID, broadcast) {
        const service = this.services.get(serviceUUID);
        if (!service) {
            throw new Error(`Service ${serviceUUID} not found`);
        }
        const characteristic = service.characteristics.get(characteristicUUID);
        if (!characteristic) {
            throw new Error(`Characteristic ${characteristicUUID} in service ${serviceUUID} not found`);
        }
        const data = await this.queueCommand(this.readByTypeRequest(characteristic.startHandle, characteristic.endHandle, CONST.GATT_SERVER_CHARAC_CFG_UUID), false);
        const opcode = data[0];
        if (opcode !== CONST.ATT_OP_READ_BY_TYPE_RESP) {
            throw new Error(`Broadcast error, opcode ${opcode}`);
        }
        const handle = data.readUInt16LE(2);
        let value = data.readUInt16LE(4);
        if (broadcast) {
            value |= 0x0001;
        }
        else {
            value &= 0xfffe;
        }
        const valueBuffer = Buffer.alloc(2);
        valueBuffer.writeUInt16LE(value, 0);
        const moreData = await this.queueCommand(this.writeRequest(handle, valueBuffer, false), false);
        const moreOpcode = moreData[0];
        if (moreOpcode !== CONST.ATT_OP_WRITE_RESP) {
            throw new Error(`Broadcast error, opcode ${opcode}`);
        }
    }
    async notify(serviceUUID, characteristicUUID, notify) {
        const service = this.services.get(serviceUUID);
        if (!service) {
            throw new Error(`Service ${serviceUUID} not found`);
        }
        const characteristic = service.characteristics.get(characteristicUUID);
        if (!characteristic) {
            throw new Error(`Characteristic ${characteristicUUID} in service ${serviceUUID} not found`);
        }
        const data = await this.queueCommand(this.readByTypeRequest(characteristic.startHandle, characteristic.endHandle, CONST.GATT_CLIENT_CHARAC_CFG_UUID), false);
        const opcode = data[0];
        if (opcode === CONST.ATT_OP_READ_BY_TYPE_RESP) {
            const handle = data.readUInt16LE(2);
            let value = data.readUInt16LE(4);
            const useNotify = characteristic.properties.includes('notify');
            const useIndicate = characteristic.properties.includes('indicate');
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
            const valueBuffer = Buffer.alloc(2);
            valueBuffer.writeUInt16LE(value, 0);
            const moreData = await this.queueCommand(this.writeRequest(handle, valueBuffer, false), false);
            const moreOpcode = moreData[0];
            if (moreOpcode !== CONST.ATT_OP_WRITE_RESP) {
                throw new Error(`Notify error, opcode ${opcode}`);
            }
        }
    }
    async discoverDescriptors(serviceUUID, characteristicUUID) {
        const service = this.services.get(serviceUUID);
        if (!service) {
            throw new Error(`Service ${serviceUUID} not found`);
        }
        const characteristic = service.characteristics.get(characteristicUUID);
        if (!characteristic) {
            throw new Error(`Characteristic ${characteristicUUID} in service ${serviceUUID} not found`);
        }
        const newDescs = [];
        let startHandle = characteristic.valueHandle + 1;
        while (true) {
            const data = await this.queueCommand(this.findInfoRequest(startHandle, characteristic.endHandle), false);
            const opcode = data[0];
            if (opcode === CONST.ATT_OP_FIND_INFO_RESP) {
                const num = data[1];
                for (let i = 0; i < num; i++) {
                    const descHandle = data.readUInt16LE(2 + i * 4 + 0);
                    const uuid = data.readUInt16LE(2 + i * 4 + 2).toString(16);
                    const newDescriptor = new Descriptor_1.HciGattDescriptorRemote(characteristic, uuid, descHandle);
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
    }
    async readValue(serviceUUID, characteristicUUID, descriptorUUID) {
        const service = this.services.get(serviceUUID);
        if (!service) {
            throw new Error(`Service ${serviceUUID} not found`);
        }
        const characteristic = service.characteristics.get(characteristicUUID);
        if (!characteristic) {
            throw new Error(`Characteristic ${characteristicUUID} in service ${serviceUUID} not found`);
        }
        const descriptor = characteristic.descriptors.get(descriptorUUID);
        if (!descriptor) {
            throw new Error(`Descriptor ${descriptorUUID} in characteristic ${characteristicUUID} in service ${serviceUUID} not found`);
        }
        let readData = Buffer.alloc(0);
        let data = await this.queueCommand(this.readRequest(descriptor.handle), false);
        let opcode = data[0];
        while (true) {
            if (opcode !== CONST.ATT_OP_READ_RESP && opcode !== CONST.ATT_OP_READ_BLOB_RESP) {
                return readData;
            }
            readData = Buffer.concat([readData, data.slice(1)]);
            if (data.length !== this.mtu) {
                return readData;
            }
            data = await this.queueCommand(this.readBlobRequest(descriptor.handle, readData.length), false);
            opcode = data[0];
        }
    }
    async writeValue(serviceUUID, characteristicUUID, descriptorUUID, data) {
        const service = this.services.get(serviceUUID);
        if (!service) {
            throw new Error(`Service ${serviceUUID} not found`);
        }
        const characteristic = service.characteristics.get(characteristicUUID);
        if (!characteristic) {
            throw new Error(`Characteristic ${characteristicUUID} in service ${serviceUUID} not found`);
        }
        const descriptor = characteristic.descriptors.get(descriptorUUID);
        if (!descriptor) {
            throw new Error(`Descriptor ${descriptorUUID} in characteristic ${characteristicUUID} in service ${serviceUUID} not found`);
        }
        const respData = await this.queueCommand(this.writeRequest(descriptor.handle, data, false), false);
        const opcode = respData[0];
        if (opcode !== CONST.ATT_OP_WRITE_RESP) {
            throw new Error(`WriteValue error, opcode ${opcode}`);
        }
    }
}
exports.HciGattRemote = HciGattRemote;
//# sourceMappingURL=Gatt.js.map