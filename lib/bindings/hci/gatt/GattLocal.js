"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HciGattLocal = void 0;
const models_1 = require("../../../models");
const misc_1 = require("../misc");
const Service_1 = require("./Service");
// 512 bytes is max char size + 1 byte att opcode + 2 bytes handle + 2 bytes offset for long writes
const DEFAULT_MAX_MTU = 517;
class HciGattLocal extends models_1.Gatt {
    constructor(adapter, hci, maxMtu = DEFAULT_MAX_MTU) {
        super(null, adapter, maxMtu);
        this.services = new Map();
        this.onHciDisconnect = (status, handleId) => {
            // Reset MTU after a device disconnects
            this.negotiatedMtus.delete(handleId);
        };
        this.onAclStreamData = (handle, cid, data) => __awaiter(this, void 0, void 0, function* () {
            if (cid !== misc_1.Codes.ATT_CID) {
                return;
            }
            const requestType = data[0];
            let response = null;
            try {
                switch (requestType) {
                    case misc_1.Codes.ATT_OP_MTU_REQ:
                        response = yield this.handleMtuRequest(handle, cid, data);
                        break;
                    case misc_1.Codes.ATT_OP_FIND_INFO_REQ:
                        response = yield this.handleFindInfoRequest(handle, cid, data);
                        break;
                    case misc_1.Codes.ATT_OP_FIND_BY_TYPE_REQ:
                        response = yield this.handleFindByTypeRequest(handle, cid, data);
                        break;
                    case misc_1.Codes.ATT_OP_READ_BY_TYPE_REQ:
                        response = yield this.handleReadByTypeRequest(handle, cid, data);
                        break;
                    case misc_1.Codes.ATT_OP_READ_REQ:
                    case misc_1.Codes.ATT_OP_READ_BLOB_REQ:
                        response = yield this.handleReadOrReadBlobRequest(handle, cid, data);
                        break;
                    case misc_1.Codes.ATT_OP_READ_BY_GROUP_REQ:
                        response = yield this.handleReadByGroupRequest(handle, cid, data);
                        break;
                    case misc_1.Codes.ATT_OP_WRITE_REQ:
                    case misc_1.Codes.ATT_OP_WRITE_CMD:
                        response = yield this.handleWriteRequestOrCommand(handle, cid, data);
                        break;
                    case misc_1.Codes.ATT_OP_PREPARE_WRITE_REQ:
                        response = yield this.handlePrepareWriteRequest(handle, cid, data);
                        break;
                    case misc_1.Codes.ATT_OP_EXECUTE_WRITE_REQ:
                        response = yield this.handleExecuteWriteRequest(handle, cid, data);
                        break;
                    case misc_1.Codes.ATT_OP_HANDLE_CNF:
                        response = yield this.handleConfirmation(handle, cid, data);
                        break;
                    default:
                    case misc_1.Codes.ATT_OP_READ_MULTI_REQ:
                    case misc_1.Codes.ATT_OP_SIGNED_WRITE_CMD:
                        // console.log('[ACL]', 'UNSUPPORTED', requestType, data);
                        response = this.errorResponse(requestType, 0x0000, misc_1.Codes.ATT_ECODE_REQ_NOT_SUPP);
                        break;
                }
            }
            catch (err) {
                // TODO: How should errors thrown inside possibly user-defined functions be propagated?
                // console.error(err);
            }
            if (response) {
                this.hci.writeAclDataPkt(handle, cid, response);
            }
        });
        this.hci = hci;
        this.hci.on('aclDataPkt', this.onAclStreamData);
        this.hci.on('disconnectComplete', this.onHciDisconnect);
        this.negotiatedMtus = new Map();
    }
    get deviceName() {
        return this._deviceName;
    }
    addService(uuid) {
        return __awaiter(this, void 0, void 0, function* () {
            const srv = new Service_1.HciGattService(this, uuid, false, 0, 0);
            this.services.set(srv.uuid, srv);
            return srv;
        });
    }
    prepare(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const handles = [];
            this._deviceName = name;
            this.services.delete('1800');
            const srv1800 = yield this.addService('1800');
            yield srv1800.addCharacteristic('2a00', ['read'], [], Buffer.from(name));
            yield srv1800.addCharacteristic('2a01', ['read'], [], Buffer.from([0x80, 0x00]));
            this.services.delete('1801');
            const srv1801 = yield this.addService('1801');
            yield srv1801.addCharacteristic('2a05', ['read'], [], Buffer.from([0x00, 0x00, 0x00, 0x00]));
            let handle = 1;
            for (const service of this.services.values()) {
                const serviceStartHandle = handle++;
                service.startHandle = serviceStartHandle; // End handle determined below
                const serviceHandle = { type: 'service', object: service };
                handles[serviceStartHandle] = serviceHandle;
                for (const char of service.characteristics.values()) {
                    const charStartHandle = handle++;
                    const charValueHandle = handle++;
                    char.startHandle = charStartHandle;
                    char.valueHandle = charValueHandle;
                    handles[charStartHandle] = {
                        type: 'characteristic',
                        object: char
                    };
                    handles[charValueHandle] = {
                        type: 'characteristicValue',
                        object: char
                    };
                    if (char.properties.includes('indicate') || char.properties.includes('notify')) {
                        // notify or indicate: add client characteristic configuration descriptor
                        char.descriptors.delete('2902');
                        yield char.addDescriptor('2902', Buffer.from([0x00, 0x00]));
                    }
                    for (const descr of char.descriptors.values()) {
                        const descrHandle = handle++;
                        descr.handle = descrHandle;
                        handles[descrHandle] = { type: 'descriptor', object: descr };
                    }
                }
                // Set service end handle
                service.endHandle = handle - 1;
            }
            this.handles = handles;
        });
    }
    errorResponse(opcode, handle, status) {
        const buf = Buffer.alloc(5);
        buf.writeUInt8(misc_1.Codes.ATT_OP_ERROR, 0);
        buf.writeUInt8(opcode, 1);
        buf.writeUInt16LE(handle, 2);
        buf.writeUInt8(status, 4);
        return buf;
    }
    getMtu(handle) {
        return this.negotiatedMtus.get(handle) || 23;
    }
    handleMtuRequest(_handle, _cid, request) {
        return __awaiter(this, void 0, void 0, function* () {
            let mtu = request.readUInt16LE(1);
            mtu = Math.max(23, Math.min(mtu, this.mtu));
            this.negotiatedMtus.set(_handle, mtu);
            const response = Buffer.alloc(3);
            response.writeUInt8(misc_1.Codes.ATT_OP_MTU_RESP, 0);
            response.writeUInt16LE(mtu, 1);
            return response;
        });
    }
    handleFindInfoRequest(_handle, _cid, request) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = null;
            const startHandle = Math.max(request.readUInt16LE(1), 1);
            const endHandle = Math.min(request.readUInt16LE(3), this.handles.length - 1);
            const infos = [];
            for (let i = startHandle; i <= endHandle; i++) {
                const handle = this.handles[i];
                let uuid = null;
                if (handle.type === 'service') {
                    uuid = '2800';
                }
                else if (handle.type === 'characteristic') {
                    uuid = '2803';
                }
                else if (handle.type === 'characteristicValue') {
                    uuid = this.handles[i - 1].object.uuid;
                }
                else if (handle.type === 'descriptor') {
                    uuid = handle.object.uuid;
                }
                if (uuid) {
                    infos.push({
                        handle: i,
                        uuid: uuid
                    });
                }
            }
            if (infos.length) {
                const uuidSize = infos[0].uuid.length / 2;
                let numInfo = 1;
                for (let i = 1; i < infos.length; i++) {
                    if (infos[0].uuid.length !== infos[i].uuid.length) {
                        break;
                    }
                    numInfo++;
                }
                const lengthPerInfo = uuidSize === 2 ? 4 : 18;
                const maxInfo = Math.floor((this.getMtu(_handle) - 2) / lengthPerInfo);
                numInfo = Math.min(numInfo, maxInfo);
                response = Buffer.alloc(2 + numInfo * lengthPerInfo);
                response[0] = misc_1.Codes.ATT_OP_FIND_INFO_RESP;
                response[1] = uuidSize === 2 ? 0x01 : 0x2;
                for (let i = 0; i < numInfo; i++) {
                    const info = infos[i];
                    response.writeUInt16LE(info.handle, 2 + i * lengthPerInfo);
                    const uuid = Buffer.from(info.uuid
                        .match(/.{1,2}/g)
                        .reverse()
                        .join(''), 'hex');
                    for (let j = 0; j < uuid.length; j++) {
                        response[2 + i * lengthPerInfo + 2 + j] = uuid[j];
                    }
                }
            }
            else {
                response = this.errorResponse(misc_1.Codes.ATT_OP_FIND_INFO_REQ, startHandle, misc_1.Codes.ATT_ECODE_ATTR_NOT_FOUND);
            }
            return response;
        });
    }
    handleFindByTypeRequest(_handle, _cid, request) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = null;
            const startHandle = Math.max(request.readUInt16LE(1), 1);
            const endHandle = Math.min(request.readUInt16LE(3), this.handles.length - 1);
            const uuid = request
                .slice(5, 7)
                .toString('hex')
                .match(/.{1,2}/g)
                .reverse()
                .join('');
            const value = request
                .slice(7)
                .toString('hex')
                .match(/.{1,2}/g)
                .reverse()
                .join('');
            const handles = [];
            for (let i = startHandle; i <= endHandle; i++) {
                const handle = this.handles[i];
                if ('2800' === uuid && handle.type === 'service' && handle.object.uuid === value) {
                    handles.push({
                        start: handle.object.startHandle,
                        end: handle.object.endHandle
                    });
                }
            }
            if (handles.length) {
                const lengthPerHandle = 4;
                const maxHandles = Math.floor((this.getMtu(_handle) - 1) / lengthPerHandle);
                const numHandles = Math.min(handles.length, maxHandles);
                response = Buffer.alloc(1 + numHandles * lengthPerHandle);
                response[0] = misc_1.Codes.ATT_OP_FIND_BY_TYPE_RESP;
                for (let i = 0; i < numHandles; i++) {
                    const handle = handles[i];
                    response.writeUInt16LE(handle.start, 1 + i * lengthPerHandle);
                    response.writeUInt16LE(handle.end, 1 + i * lengthPerHandle + 2);
                }
            }
            else {
                response = this.errorResponse(misc_1.Codes.ATT_OP_FIND_BY_TYPE_REQ, startHandle, misc_1.Codes.ATT_ECODE_ATTR_NOT_FOUND);
            }
            return response;
        });
    }
    handleReadByGroupRequest(_handle, _cid, request) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = null;
            const startHandle = Math.max(request.readUInt16LE(1), 1);
            const endHandle = Math.min(request.readUInt16LE(3), this.handles.length - 1);
            const uuid = request
                .slice(5)
                .toString('hex')
                .match(/.{1,2}/g)
                .reverse()
                .join('');
            if (uuid === '2800' || uuid === '2802') {
                const srvHandles = [];
                const type = uuid === '2800' ? 'service' : 'includedService';
                for (let i = startHandle; i <= endHandle; i++) {
                    const handle = this.handles[i];
                    if (handle.type === type) {
                        srvHandles.push(handle);
                    }
                }
                if (srvHandles.length) {
                    const uuidSize = srvHandles[0].object.uuid.length / 2;
                    let numServices = 1;
                    for (let i = 1; i < srvHandles.length; i++) {
                        if (srvHandles[0].object.uuid.length !== srvHandles[i].object.uuid.length) {
                            break;
                        }
                        numServices++;
                    }
                    const lengthPerService = uuidSize === 2 ? 6 : 20;
                    const maxServices = Math.floor((this.getMtu(_handle) - 2) / lengthPerService);
                    numServices = Math.min(numServices, maxServices);
                    response = Buffer.alloc(2 + numServices * lengthPerService);
                    response[0] = misc_1.Codes.ATT_OP_READ_BY_GROUP_RESP;
                    response[1] = lengthPerService;
                    for (let i = 0; i < numServices; i++) {
                        const srvHandle = srvHandles[i];
                        response.writeUInt16LE(srvHandle.object.startHandle, 2 + i * lengthPerService);
                        response.writeUInt16LE(srvHandle.object.endHandle, 2 + i * lengthPerService + 2);
                        const serviceUuid = Buffer.from(srvHandle.object.uuid
                            .match(/.{1,2}/g)
                            .reverse()
                            .join(''), 'hex');
                        for (let j = 0; j < serviceUuid.length; j++) {
                            response[2 + i * lengthPerService + 4 + j] = serviceUuid[j];
                        }
                    }
                }
                else {
                    response = this.errorResponse(misc_1.Codes.ATT_OP_READ_BY_GROUP_REQ, startHandle, misc_1.Codes.ATT_ECODE_ATTR_NOT_FOUND);
                }
            }
            else {
                response = this.errorResponse(misc_1.Codes.ATT_OP_READ_BY_GROUP_REQ, startHandle, misc_1.Codes.ATT_ECODE_UNSUPP_GRP_TYPE);
            }
            return response;
        });
    }
    handleReadByTypeRequest(_handle, _cid, request) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = null;
            const startHandle = Math.max(request.readUInt16LE(1), 1);
            const endHandle = Math.min(request.readUInt16LE(3), this.handles.length - 1);
            const uuid = request
                .slice(5)
                .toString('hex')
                .match(/.{1,2}/g)
                .reverse()
                .join('');
            if (uuid === '2803') {
                const charHandles = [];
                for (let i = startHandle; i <= endHandle; i++) {
                    const handle = this.handles[i];
                    if (handle.type === 'characteristic') {
                        charHandles.push(handle);
                    }
                }
                if (charHandles.length) {
                    const uuidSize = charHandles[0].object.uuid.length / 2;
                    let numCharacteristics = 1;
                    for (let i = 1; i < charHandles.length; i++) {
                        if (charHandles[0].object.uuid.length !== charHandles[i].object.uuid.length) {
                            break;
                        }
                        numCharacteristics++;
                    }
                    const lengthPerCharacteristic = uuidSize === 2 ? 7 : 21;
                    const maxCharacteristics = Math.floor((this.getMtu(_handle) - 2) / lengthPerCharacteristic);
                    numCharacteristics = Math.min(numCharacteristics, maxCharacteristics);
                    response = Buffer.alloc(2 + numCharacteristics * lengthPerCharacteristic);
                    response[0] = misc_1.Codes.ATT_OP_READ_BY_TYPE_RESP;
                    response[1] = lengthPerCharacteristic;
                    for (let i = 0; i < numCharacteristics; i++) {
                        const charHandle = charHandles[i];
                        response.writeUInt16LE(charHandle.object.startHandle, 2 + i * lengthPerCharacteristic);
                        response.writeUInt8(charHandle.object.propertyFlag, 2 + i * lengthPerCharacteristic + 2);
                        response.writeUInt16LE(charHandle.object.valueHandle, 2 + i * lengthPerCharacteristic + 3);
                        const characteristicUuid = Buffer.from(charHandle.object.uuid
                            .match(/.{1,2}/g)
                            .reverse()
                            .join(''), 'hex');
                        for (let j = 0; j < characteristicUuid.length; j++) {
                            response[2 + i * lengthPerCharacteristic + 5 + j] = characteristicUuid[j];
                        }
                    }
                }
                else {
                    response = this.errorResponse(misc_1.Codes.ATT_OP_READ_BY_TYPE_REQ, startHandle, misc_1.Codes.ATT_ECODE_ATTR_NOT_FOUND);
                }
            }
            else {
                let handleId = startHandle;
                let handleObject = null;
                let secure = false;
                for (; handleId <= endHandle; handleId++) {
                    const handle = this.handles[handleId];
                    if (handle.type === 'characteristic' && handle.object.uuid === uuid) {
                        handleObject = handle.object;
                        handleId = handle.object.valueHandle;
                        secure = handle.object.secure.includes('read');
                        break;
                    }
                    else if (handle.type === 'descriptor' && handle.object.uuid === uuid) {
                        handleObject = handle.object;
                        secure = false; // handle.object.secure.includes('read');
                        break;
                    }
                }
                if (secure /*&& !this._aclStream.encrypted*/) {
                    response = this.errorResponse(misc_1.Codes.ATT_OP_READ_BY_TYPE_REQ, startHandle, misc_1.Codes.ATT_ECODE_AUTHENTICATION);
                }
                else if (handleObject) {
                    let responseStatus = 0;
                    let responseBuffer = null;
                    if (handleObject instanceof models_1.GattCharacteristic) {
                        try {
                            responseBuffer = yield handleObject.handleRead(0);
                            responseStatus = misc_1.Codes.ATT_ECODE_SUCCESS;
                        }
                        catch (_a) {
                            responseStatus = misc_1.Codes.ATT_ECODE_UNLIKELY;
                            responseBuffer = null;
                        }
                    }
                    else {
                        responseStatus = misc_1.Codes.ATT_OP_READ_BY_TYPE_RESP;
                        responseBuffer = yield handleObject.handleRead(0);
                    }
                    if (responseStatus === misc_1.Codes.ATT_ECODE_SUCCESS) {
                        const dataLength = Math.min(responseBuffer.length, this.getMtu(_handle) - 4);
                        response = Buffer.alloc(4 + dataLength);
                        response[0] = misc_1.Codes.ATT_OP_READ_BY_TYPE_RESP;
                        response[1] = dataLength + 2;
                        response.writeUInt16LE(handleId, 2);
                        for (let i = 0; i < dataLength; i++) {
                            response[4 + i] = responseBuffer[i];
                        }
                    }
                    else {
                        response = this.errorResponse(misc_1.Codes.ATT_OP_READ_BY_TYPE_REQ, handleId, responseStatus);
                    }
                }
                else {
                    response = this.errorResponse(misc_1.Codes.ATT_OP_READ_BY_TYPE_REQ, startHandle, misc_1.Codes.ATT_ECODE_ATTR_NOT_FOUND);
                }
            }
            return response;
        });
    }
    handleReadOrReadBlobRequest(_handle, _cid, request) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = null;
            const requestType = request[0];
            const valueHandle = request.readUInt16LE(1);
            const offset = requestType === misc_1.Codes.ATT_OP_READ_BLOB_REQ ? request.readUInt16LE(3) : 0;
            const handle = this.handles[valueHandle];
            if (handle) {
                let result = null;
                let data = null;
                if (handle.type === 'service') {
                    result = misc_1.Codes.ATT_ECODE_SUCCESS;
                    data = Buffer.from(handle.object.uuid
                        .match(/.{1,2}/g)
                        .reverse()
                        .join(''), 'hex');
                }
                else if (handle.type === 'characteristic') {
                    const uuid = Buffer.from(handle.object.uuid
                        .match(/.{1,2}/g)
                        .reverse()
                        .join(''), 'hex');
                    result = misc_1.Codes.ATT_ECODE_SUCCESS;
                    data = Buffer.alloc(3 + uuid.length);
                    data.writeUInt8(handle.object.propertyFlag, 0);
                    data.writeUInt16LE(handle.object.valueHandle, 1);
                    for (let i = 0; i < uuid.length; i++) {
                        data[i + 3] = uuid[i];
                    }
                }
                else if (handle.type === 'characteristicValue') {
                    if (handle.object.properties.includes('read')) {
                        if (handle.object.secure.includes('read') /*&& !this._aclStream.encrypted*/) {
                            result = misc_1.Codes.ATT_ECODE_AUTHENTICATION;
                        }
                        else {
                            try {
                                data = yield handle.object.handleRead(offset);
                                result = misc_1.Codes.ATT_ECODE_SUCCESS;
                            }
                            catch (_a) {
                                result = misc_1.Codes.ATT_ECODE_UNLIKELY;
                                data = null;
                            }
                        }
                    }
                    else {
                        result = misc_1.Codes.ATT_ECODE_READ_NOT_PERM; // non-readable
                    }
                }
                else if (handle.type === 'descriptor') {
                    // TODO: Descriptors are always read-only and not secure
                    result = misc_1.Codes.ATT_ECODE_SUCCESS;
                    data = yield handle.object.handleRead(offset);
                }
                if (result !== null) {
                    if (result === misc_1.Codes.ATT_ECODE_SUCCESS) {
                        const dataLength = Math.min(data.length, this.getMtu(_handle) - 1);
                        response = Buffer.alloc(1 + dataLength);
                        response[0] =
                            requestType === misc_1.Codes.ATT_OP_READ_BLOB_REQ ? misc_1.Codes.ATT_OP_READ_BLOB_RESP : misc_1.Codes.ATT_OP_READ_RESP;
                        for (let i = 0; i < dataLength; i++) {
                            response[1 + i] = data[i];
                        }
                    }
                    else {
                        response = this.errorResponse(requestType, valueHandle, result);
                    }
                }
            }
            else {
                response = this.errorResponse(requestType, valueHandle, misc_1.Codes.ATT_ECODE_INVALID_HANDLE);
            }
            return response;
        });
    }
    handleWriteRequestOrCommand(_handle, _cid, request) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = null;
            const requestType = request[0];
            const withoutResponse = requestType === misc_1.Codes.ATT_OP_WRITE_CMD;
            const valueHandle = request.readUInt16LE(1);
            const requestData = request.slice(3);
            const offset = 0;
            const handle = this.handles[valueHandle];
            if (handle && handle.type !== 'service') {
                if (handle.type === 'descriptor' ||
                    (withoutResponse
                        ? handle.object.properties.includes('write-without-response')
                        : handle.object.properties.includes('write'))) {
                    if (handle.type !== 'descriptor' &&
                        (withoutResponse
                            ? handle.object.secure.includes('write-without-response')
                            : handle.object.secure.includes('write')) /*&& !this._aclStream.encrypted*/) {
                        response = this.errorResponse(requestType, valueHandle, misc_1.Codes.ATT_ECODE_AUTHENTICATION);
                    }
                    else if (handle.type === 'descriptor' || handle.object.uuid === '2902') {
                        let result = null;
                        let data = null;
                        console.log('write req 1', requestData);
                        if (requestData.length !== 2) {
                            result = misc_1.Codes.ATT_ECODE_INVAL_ATTR_VALUE_LEN;
                        }
                        else {
                            const value = requestData.readUInt16LE(0);
                            if (handle.type === 'descriptor') {
                                handle.object.handleWrite(offset, requestData);
                            }
                            // tslint:disable-next-line: no-bitwise
                            if (value & 0x0003) {
                                // console.log('subscribe');
                                const useNotify = true; // handle.object.properties.indexOf('notify') !== -1;
                                // const useIndicate = handle.object.properties.indexOf('indicate') !== -1;
                                if (useNotify) {
                                    data = Buffer.alloc(3);
                                    data.writeUInt8(misc_1.Codes.ATT_OP_HANDLE_NOTIFY, 0);
                                    data.writeUInt16LE(valueHandle, 1);
                                } /*else if (useIndicate) {
                                    const indicateMessage = Buffer.alloc(3 + dataLength);
    
                                    indicateMessage.writeUInt8(CONST.ATT_OP_HANDLE_IND, 0);
                                    indicateMessage.writeUInt16LE(charHandle, 1);
    
                                    for (let i = 0; i < dataLength; i++) {
                                        indicateMessage[3 + i] = data[i];
                                    }
    
                                    this._lastIndicatedAttribute = attribute;
    
                                    this.send(indicateMessage);
                                }*/
                            }
                            else {
                                // console.log('unsubscribe');
                                data = Buffer.alloc(0);
                            }
                            result = misc_1.Codes.ATT_ECODE_SUCCESS;
                        }
                        if (result !== null) {
                            if (result === misc_1.Codes.ATT_ECODE_SUCCESS) {
                                const dataLength = Math.min(data.length, this.getMtu(_handle) - 1);
                                response = Buffer.alloc(1 + dataLength);
                                response[0] = misc_1.Codes.ATT_OP_WRITE_RESP;
                                for (let i = 0; i < dataLength; i++) {
                                    response[1 + i] = data[i];
                                }
                            }
                            else {
                                response = this.errorResponse(requestType, valueHandle, result);
                            }
                        }
                    }
                    else {
                        const result = yield handle.object.handleWrite(offset, requestData, withoutResponse);
                        response =
                            result === misc_1.Codes.ATT_ECODE_SUCCESS
                                ? Buffer.from([misc_1.Codes.ATT_OP_WRITE_RESP])
                                : this.errorResponse(requestType, valueHandle, result);
                    }
                }
                else {
                    response = this.errorResponse(requestType, valueHandle, misc_1.Codes.ATT_ECODE_WRITE_NOT_PERM);
                }
            }
            else {
                response = this.errorResponse(requestType, valueHandle, misc_1.Codes.ATT_ECODE_INVALID_HANDLE);
            }
            return response;
        });
    }
    handlePrepareWriteRequest(handle, cid, request) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error(`Method not implemented`);
            /*let response: Buffer = null;
    
            const requestType = request[0];
            const valueHandle = request.readUInt16LE(1);
            const offset = request.readUInt16LE(3);
            const data = request.slice(5);
    
            let handle = this.handles[valueHandle];
    
            if (handle) {
                if (handle.type === 'characteristicValue') {
                    handle = this.handles[valueHandle - 1];
    
                    var handleProperties = handle.properties;
                    var handleSecure = handle.secure;
    
                    if (handleProperties && handleProperties & 0x08) {
                        if (handleSecure & 0x08 && !this._aclStream.encrypted) {
                            response = this.errorResponse(requestType, valueHandle, CONST.ATT_ECODE_AUTHENTICATION);
                        } else if (this._preparedWriteRequest) {
                            if (this._preparedWriteRequest.handle !== handle) {
                                response = this.errorResponse(requestType, valueHandle, CONST.ATT_ECODE_UNLIKELY);
                            } else if (offset === this._preparedWriteRequest.offset + this._preparedWriteRequest.data.length) {
                                this._preparedWriteRequest.data = Buffer.concat([this._preparedWriteRequest.data, data]);
    
                                response = Buffer.alloc(request.length);
                                request.copy(response);
                                response[0] = CONST.ATT_OP_PREPARE_WRITE_RESP;
                            } else {
                                response = this.errorResponse(requestType, valueHandle, CONST.ATT_ECODE_INVALID_OFFSET);
                            }
                        } else {
                            this._preparedWriteRequest = {
                                handle: handle,
                                valueHandle: valueHandle,
                                offset: offset,
                                data: data
                            };
    
                            response = new Buffer(request.length);
                            request.copy(response);
                            response[0] = CONST.ATT_OP_PREPARE_WRITE_RESP;
                        }
                    } else {
                        response = this.errorResponse(requestType, valueHandle, CONST.ATT_ECODE_WRITE_NOT_PERM);
                    }
                } else {
                    response = this.errorResponse(requestType, valueHandle, CONST.ATT_ECODE_ATTR_NOT_LONG);
                }
            } else {
                response = this.errorResponse(requestType, valueHandle, CONST.ATT_ECODE_INVALID_HANDLE);
            }
    
            return response;*/
        });
    }
    handleExecuteWriteRequest(handle, cid, request) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error(`Method not implemented`);
            /*
            let response: Buffer = null;
    
            const requestType = request[0];
            const flag = request[1];
    
            if (this._preparedWriteRequest) {
                const valueHandle = this._preparedWriteRequest.valueHandle;
    
                if (flag === 0x00) {
                    response = Buffer.from([CONST.ATT_OP_EXECUTE_WRITE_RESP]);
                } else if (flag === 0x01) {
                    const newValueHandle = this._preparedWriteRequest.valueHandle;
                    const callback = () => {
                        return (result) => {
                            var callbackResponse = null;
    
                            if (CONST.ATT_ECODE_SUCCESS === result) {
                                callbackResponse = Buffer.from([CONST.ATT_OP_EXECUTE_WRITE_RESP]);
                            } else {
                                callbackResponse = this.errorResponse(requestType, newValueHandle, result);
                            }
    
                            this.send(callbackResponse);
                        };
                    };
    
                    this._preparedWriteRequest.handle.attribute.emit(
                        'writeRequest',
                        this._preparedWriteRequest.data,
                        this._preparedWriteRequest.offset,
                        false,
                        callback
                    );
                } else {
                    response = this.errorResponse(requestType, 0x0000, CONST.ATT_ECODE_UNLIKELY);
                }
    
                this._preparedWriteRequest = null;
            } else {
                response = this.errorResponse(requestType, 0x0000, CONST.ATT_ECODE_UNLIKELY);
            }
    
            return response;*/
        });
    }
    handleConfirmation(handle, cid, request) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error(`Method not implemented`);
            /*
            if (this._lastIndicatedAttribute) {
                if (this._lastIndicatedAttribute.emit) {
                    this._lastIndicatedAttribute.emit('indicate');
                }
    
                this._lastIndicatedAttribute = null;
            }
    
            return undefined;*/
        });
    }
    discoverServices() {
        throw new Error('Method not implemented.');
    }
}
exports.HciGattLocal = HciGattLocal;
//# sourceMappingURL=GattLocal.js.map