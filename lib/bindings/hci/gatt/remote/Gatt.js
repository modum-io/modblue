"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HciGattRemote = void 0;
const models_1 = require("../../../../models");
const Characteristic_1 = require("./Characteristic");
const Descriptor_1 = require("./Descriptor");
const Service_1 = require("./Service");
// tslint:disable: no-bitwise
const ATT_OP_ERROR = 0x01;
const ATT_OP_MTU_REQ = 0x02;
const ATT_OP_MTU_RESP = 0x03;
const ATT_OP_FIND_INFO_REQ = 0x04;
const ATT_OP_FIND_INFO_RESP = 0x05;
const ATT_OP_READ_BY_TYPE_REQ = 0x08;
const ATT_OP_READ_BY_TYPE_RESP = 0x09;
const ATT_OP_READ_REQ = 0x0a;
const ATT_OP_READ_RESP = 0x0b;
const ATT_OP_READ_BLOB_REQ = 0x0c;
const ATT_OP_READ_BLOB_RESP = 0x0d;
const ATT_OP_READ_BY_GROUP_REQ = 0x10;
const ATT_OP_READ_BY_GROUP_RESP = 0x11;
const ATT_OP_WRITE_REQ = 0x12;
const ATT_OP_WRITE_RESP = 0x13;
const ATT_OP_PREPARE_WRITE_REQ = 0x16;
const ATT_OP_PREPARE_WRITE_RESP = 0x17;
const ATT_OP_EXECUTE_WRITE_REQ = 0x18;
const ATT_OP_EXECUTE_WRITE_RESP = 0x19;
const ATT_OP_HANDLE_NOTIFY = 0x1b;
const ATT_OP_HANDLE_IND = 0x1d;
const ATT_OP_HANDLE_CNF = 0x1e;
const ATT_OP_WRITE_CMD = 0x52;
const ATT_ECODE_SUCCESS = 0x00;
const ATT_ECODE_INVALID_HANDLE = 0x01;
const ATT_ECODE_READ_NOT_PERM = 0x02;
const ATT_ECODE_WRITE_NOT_PERM = 0x03;
const ATT_ECODE_INVALID_PDU = 0x04;
const ATT_ECODE_AUTHENTICATION = 0x05;
const ATT_ECODE_REQ_NOT_SUPP = 0x06;
const ATT_ECODE_INVALID_OFFSET = 0x07;
const ATT_ECODE_AUTHORIZATION = 0x08;
const ATT_ECODE_PREP_QUEUE_FULL = 0x09;
const ATT_ECODE_ATTR_NOT_FOUND = 0x0a;
const ATT_ECODE_ATTR_NOT_LONG = 0x0b;
const ATT_ECODE_INSUFF_ENCR_KEY_SIZE = 0x0c;
const ATT_ECODE_INVAL_ATTR_VALUE_LEN = 0x0d;
const ATT_ECODE_UNLIKELY = 0x0e;
const ATT_ECODE_INSUFF_ENC = 0x0f;
const ATT_ECODE_UNSUPP_GRP_TYPE = 0x10;
const ATT_ECODE_INSUFF_RESOURCES = 0x11;
const GATT_PRIM_SVC_UUID = 0x2800;
const GATT_INCLUDE_UUID = 0x2802;
const GATT_CHARAC_UUID = 0x2803;
const GATT_CLIENT_CHARAC_CFG_UUID = 0x2902;
const GATT_SERVER_CHARAC_CFG_UUID = 0x2903;
const ATT_CID = 0x0004;
class HciGattRemote extends models_1.GattRemote {
    constructor(peripheral, hci, handle) {
        super(peripheral);
        this.commandQueue = [];
        this.services = new Map();
        this.onAclStreamData = async (handle, cid, data) => {
            console.log('acl', handle, cid, data);
            if (handle !== this.handle || cid !== ATT_CID) {
                return;
            }
            if (this.currentCommand && data.toString('hex') === this.currentCommand.buffer.toString('hex')) {
                // NO-OP
            }
            else if (data[0] % 2 === 0) {
                // NO-OP
                // This used to be noble multi role stuff
            }
            else if (data[0] === ATT_OP_HANDLE_NOTIFY || data[0] === ATT_OP_HANDLE_IND) {
                /*const valueHandle = data.readUInt16LE(1);
                const valueData = data.slice(3);
    
                // this.emit('handleNotify', valueHandle, valueData);*/
                if (data[0] === ATT_OP_HANDLE_IND) {
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
                if (data[0] === ATT_OP_ERROR &&
                    (data[4] === ATT_ECODE_AUTHENTICATION ||
                        data[4] === ATT_ECODE_AUTHORIZATION ||
                        data[4] === ATT_ECODE_INSUFF_ENC) &&
                    this.security !== 'medium') {
                    // this.aclStream.encrypt();
                    return;
                }
                this.currentCommand.resolve(data);
                this.currentCommand = null;
                this.processCommands();
            }
        };
        this.hci = hci;
        this.hci.on('aclDataPkt', this.onAclStreamData);
        this.handle = handle;
    }
    processCommands() {
        while (this.commandQueue.length) {
            this.currentCommand = this.commandQueue.shift();
            this.writeAtt(this.currentCommand.buffer);
            if (this.currentCommand.resolve) {
                // If the command has a callback stop processing and wait for the callback
                break;
            }
            else if (this.currentCommand.resolveOnWrite) {
                this.currentCommand.resolveOnWrite();
                this.currentCommand = null;
            }
        }
    }
    dispose() {
        this.hci.off('aclDataPkt', this.onAclStreamData);
        this.hci = null;
        this.handle = null;
    }
    writeAtt(data) {
        this.hci.writeAclDataPkt(this.handle, ATT_CID, data);
    }
    errorResponse(opcode, handle, status) {
        const buf = Buffer.alloc(5);
        buf.writeUInt8(ATT_OP_ERROR, 0);
        buf.writeUInt8(opcode, 1);
        buf.writeUInt16LE(handle, 2);
        buf.writeUInt8(status, 4);
        return buf;
    }
    async queueCommand(buffer, resolveOnWrite) {
        return new Promise((resolve) => {
            this.commandQueue.push({
                buffer: buffer,
                resolve: !resolveOnWrite ? (data) => resolve(data) : undefined,
                resolveOnWrite: resolveOnWrite ? () => resolve() : undefined
            });
            if (this.currentCommand === null) {
                this.processCommands();
            }
        });
    }
    mtuRequest(mtu) {
        const buf = Buffer.alloc(3);
        buf.writeUInt8(ATT_OP_MTU_REQ, 0);
        buf.writeUInt16LE(mtu, 1);
        return buf;
    }
    readByGroupRequest(startHandle, endHandle, groupUUID) {
        const buf = Buffer.alloc(7);
        buf.writeUInt8(ATT_OP_READ_BY_GROUP_REQ, 0);
        buf.writeUInt16LE(startHandle, 1);
        buf.writeUInt16LE(endHandle, 3);
        buf.writeUInt16LE(groupUUID, 5);
        return buf;
    }
    readByTypeRequest(startHandle, endHandle, groupUUID) {
        const buf = Buffer.alloc(7);
        buf.writeUInt8(ATT_OP_READ_BY_TYPE_REQ, 0);
        buf.writeUInt16LE(startHandle, 1);
        buf.writeUInt16LE(endHandle, 3);
        buf.writeUInt16LE(groupUUID, 5);
        return buf;
    }
    readRequest(handle) {
        const buf = Buffer.alloc(3);
        buf.writeUInt8(ATT_OP_READ_REQ, 0);
        buf.writeUInt16LE(handle, 1);
        return buf;
    }
    readBlobRequest(handle, offset) {
        const buf = Buffer.alloc(5);
        buf.writeUInt8(ATT_OP_READ_BLOB_REQ, 0);
        buf.writeUInt16LE(handle, 1);
        buf.writeUInt16LE(offset, 3);
        return buf;
    }
    findInfoRequest(startHandle, endHandle) {
        const buf = Buffer.alloc(5);
        buf.writeUInt8(ATT_OP_FIND_INFO_REQ, 0);
        buf.writeUInt16LE(startHandle, 1);
        buf.writeUInt16LE(endHandle, 3);
        return buf;
    }
    writeRequest(handle, data, withoutResponse) {
        const buf = Buffer.alloc(3 + data.length);
        buf.writeUInt8(withoutResponse ? ATT_OP_WRITE_CMD : ATT_OP_WRITE_REQ, 0);
        buf.writeUInt16LE(handle, 1);
        for (let i = 0; i < data.length; i++) {
            buf.writeUInt8(data.readUInt8(i), i + 3);
        }
        return buf;
    }
    prepareWriteRequest(handle, offset, data) {
        const buf = Buffer.alloc(5 + data.length);
        buf.writeUInt8(ATT_OP_PREPARE_WRITE_REQ, 0);
        buf.writeUInt16LE(handle, 1);
        buf.writeUInt16LE(offset, 3);
        for (let i = 0; i < data.length; i++) {
            buf.writeUInt8(data.readUInt8(i), i + 5);
        }
        return buf;
    }
    executeWriteRequest(handle, cancelPreparedWrites) {
        const buf = Buffer.alloc(2);
        buf.writeUInt8(ATT_OP_EXECUTE_WRITE_REQ, 0);
        buf.writeUInt8(cancelPreparedWrites ? 0 : 1, 1);
        return buf;
    }
    handleConfirmation() {
        const buf = Buffer.alloc(1);
        buf.writeUInt8(ATT_OP_HANDLE_CNF, 0);
        return buf;
    }
    async exchangeMtu(mtu) {
        const data = await this.queueCommand(this.mtuRequest(mtu), false);
        const opcode = data[0];
        if (opcode === ATT_OP_MTU_RESP) {
            const newMtu = data.readUInt16LE(1);
            this._mtu = Math.min(mtu, newMtu);
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
            const data = await this.queueCommand(this.readByGroupRequest(startHandle, 0xffff, GATT_PRIM_SVC_UUID), false);
            const opcode = data[0];
            if (opcode === ATT_OP_READ_BY_GROUP_RESP) {
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
            if (opcode !== ATT_OP_READ_BY_GROUP_RESP || newServices[newServices.length - 1].endHandle === 0xffff) {
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
            const data = await this.queueCommand(this.readByTypeRequest(startHandle, service.endHandle, GATT_CHARAC_UUID), false);
            const opcode = data[0];
            if (opcode === ATT_OP_READ_BY_TYPE_RESP) {
                const type = data[1];
                const num = (data.length - 2) / type;
                for (let i = 0; i < num; i++) {
                    const offset = 2 + i * type;
                    const propertiesFlag = data.readUInt8(offset + 2);
                    const properties = [];
                    if (propertiesFlag & 0x01) {
                        properties.push('broadcast');
                    }
                    if (propertiesFlag & 0x02) {
                        properties.push('read');
                    }
                    if (propertiesFlag & 0x04) {
                        properties.push('writeWithoutResponse');
                    }
                    if (propertiesFlag & 0x08) {
                        properties.push('write');
                    }
                    if (propertiesFlag & 0x10) {
                        properties.push('notify');
                    }
                    if (propertiesFlag & 0x20) {
                        properties.push('indicate');
                    }
                    if (propertiesFlag & 0x40) {
                        properties.push('authenticatedSignedWrites');
                    }
                    if (propertiesFlag & 0x80) {
                        properties.push('extendedProperties');
                    }
                    const charStartHandle = data.readUInt16LE(offset);
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
                    const newChar = new Characteristic_1.HciGattCharacteristicRemote(service, uuid, properties, charStartHandle, charValueHandle);
                    newChars.push(newChar);
                }
            }
            if (opcode !== ATT_OP_READ_BY_TYPE_RESP || newChars[newChars.length - 1].valueHandle === service.endHandle) {
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
            if (opcode !== ATT_OP_READ_RESP && opcode !== ATT_OP_READ_BLOB_RESP) {
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
            if (opcode !== ATT_OP_WRITE_RESP) {
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
            if (chunkOpcode !== ATT_OP_PREPARE_WRITE_RESP) {
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
        if (opcode !== ATT_OP_EXECUTE_WRITE_RESP && !withoutResponse) {
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
        const data = await this.queueCommand(this.readByTypeRequest(characteristic.startHandle, characteristic.endHandle, GATT_SERVER_CHARAC_CFG_UUID), false);
        const opcode = data[0];
        if (opcode !== ATT_OP_READ_BY_TYPE_RESP) {
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
        if (moreOpcode !== ATT_OP_WRITE_RESP) {
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
        const data = await this.queueCommand(this.readByTypeRequest(characteristic.startHandle, characteristic.endHandle, GATT_CLIENT_CHARAC_CFG_UUID), false);
        const opcode = data[0];
        if (opcode === ATT_OP_READ_BY_TYPE_RESP) {
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
            if (moreOpcode !== ATT_OP_WRITE_RESP) {
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
            if (opcode === ATT_OP_FIND_INFO_RESP) {
                const num = data[1];
                for (let i = 0; i < num; i++) {
                    const descHandle = data.readUInt16LE(2 + i * 4 + 0);
                    const uuid = data.readUInt16LE(2 + i * 4 + 2).toString(16);
                    const newDescriptor = new Descriptor_1.HciGattDescriptorRemote(characteristic, uuid, descHandle);
                    newDescs.push(newDescriptor);
                }
            }
            if (opcode !== ATT_OP_FIND_INFO_RESP || newDescs[newDescs.length - 1].handle === characteristic.endHandle) {
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
            if (opcode !== ATT_OP_READ_RESP && opcode !== ATT_OP_READ_BLOB_RESP) {
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
        if (opcode !== ATT_OP_WRITE_RESP) {
            throw new Error(`WriteValue error, opcode ${opcode}`);
        }
    }
}
exports.HciGattRemote = HciGattRemote;
//# sourceMappingURL=Gatt.js.map