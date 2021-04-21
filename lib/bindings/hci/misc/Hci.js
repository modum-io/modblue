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
exports.Hci = void 0;
const async_mutex_1 = require("async-mutex");
const tiny_typed_emitter_1 = require("tiny-typed-emitter");
const Codes = __importStar(require("./HciCodes"));
const HciError_1 = require("./HciError");
const HciStatus_1 = require("./HciStatus");
const HCI_CMD_TIMEOUT = 10000; // in milliseconds
class Hci extends tiny_typed_emitter_1.TypedEmitter {
    constructor(devId, cmdTimeout = HCI_CMD_TIMEOUT) {
        super();
        this.aclPacketQueue = [];
        this.isInitializing = false;
        this.checkSocketState = () => __awaiter(this, void 0, void 0, function* () {
            const isUp = this.socket && this.socket.isDevUp();
            if (isUp !== this.isSocketUp) {
                // If the hci socket state changed the initialize or cleanup our connection
                this.isSocketUp = isUp;
                if (isUp) {
                    this.isInitializing = false;
                    try {
                        // Socket is now up
                        this.setSocketFilter();
                        yield this.reset();
                        yield this.setEventMask();
                        yield this.setLeEventMask();
                        const { hciVer, hciRev } = yield this.readLocalVersion();
                        this.hciVersion = hciVer;
                        this.hciRevision = hciRev;
                        if (hciVer < 0x06) {
                            throw new HciError_1.HciError(`HCI version ${hciVer}.${hciRev} not supported`);
                        }
                        yield this.writeLeHostSupported();
                        yield this.readLeHostSupported();
                        yield this.readBufferSize();
                        yield this.readLeBufferSize();
                        yield this.readBdAddr();
                        this.state = 'poweredOn';
                        this.emit('stateChange', this.state);
                    }
                    catch (err) {
                        this.emit('hciError', err);
                    }
                }
                else {
                    // Socket went down
                    // Cancel any pending commands
                    if (this.currentCmd) {
                        // 0x03 means "Hardware failure"
                        this.emit('cmdStatus', 0x03);
                        this.emit('cmdComplete', 0x03, null);
                        this.currentCmd = null;
                    }
                    this.state = 'poweredOff';
                    this.emit('stateChange', this.state);
                }
            }
        });
        this.onSocketData = (data) => {
            const eventType = data.readUInt8(0);
            const eventData = data.slice(1);
            // console.log('<-', 'hci', data);
            switch (eventType) {
                case Codes.HCI_EVENT_PKT:
                    this.handleEventPkt(eventData);
                    break;
                case Codes.HCI_ACLDATA_PKT:
                    this.handleAclDataPkt(eventData);
                    break;
                case Codes.HCI_COMMAND_PKT:
                    this.handleCmdPkt(eventData);
                    break;
                default:
                    break;
            }
        };
        this.onSocketError = (error) => {
            if (error.code === 'EPERM') {
                // Cancel any pending commands
                if (this.currentCmd) {
                    // 0x03 means "Hardware failure"
                    this.emit('cmdStatus', 0x03);
                    this.emit('cmdComplete', 0x03, null);
                    this.currentCmd = null;
                }
                this.state = 'unauthorized';
                this.emit('stateChange', this.state);
            }
            else if (error.message === 'Network is down') {
                // no-op
            }
        };
        this.state = 'poweredOff';
        this.devId = devId;
        // We attach about 6 listeners per connected device
        // 5 connected devices + 10 spare
        this.setMaxListeners(40);
        this.handles = new Map();
        this.cmdTimeout = cmdTimeout;
        this.mutex = async_mutex_1.withTimeout(new async_mutex_1.Mutex(), this.cmdTimeout, new HciError_1.HciError(`HCI command mutex timeout`));
        this.currentCmd = null;
    }
    static createSocket() {
        return new (require(`@modum-io/bluetooth-hci-socket`))();
    }
    static getDeviceList() {
        const socket = Hci.createSocket();
        return socket.getDeviceList();
    }
    init(timeoutInSeconds = 2) {
        if (this.isSocketUp) {
            return;
        }
        if (this.isInitializing) {
            return this.waitForInit(timeoutInSeconds);
        }
        this.socket = Hci.createSocket();
        this.socket.on('data', this.onSocketData);
        this.socket.on('error', this.onSocketError);
        this.devId = this.socket.bindRaw(this.devId);
        this.socket.start();
        this.isInitializing = true;
        this.socketTimer = setInterval(this.checkSocketState, 1000);
        this.checkSocketState();
        return this.waitForInit(timeoutInSeconds);
    }
    waitForInit(timeoutInSeconds) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                this.off('hciError', errorHandler);
                this.off('stateChange', stateChangeHandler);
                reject(new HciError_1.HciError(`Initializing socket timed out - Are you sure it's running?`, `On unix try \`sudo hciconfig hci${this.devId} up\``));
            }, timeoutInSeconds * 1000);
            const stateChangeHandler = (newState) => {
                clearTimeout(timeout);
                this.off('hciError', errorHandler);
                if (newState === 'poweredOn') {
                    resolve();
                }
                else {
                    reject(new Error(`Socket state is ${newState}`));
                }
            };
            this.once('stateChange', stateChangeHandler);
            const errorHandler = (error) => {
                clearTimeout(timeout);
                this.off('stateChange', stateChangeHandler);
                reject(new Error(`Error while initializing: ${error}`));
            };
            this.once('hciError', errorHandler);
        });
    }
    trackSentAclPackets(handleId, packets) {
        const handle = this.handles.get(handleId);
        if (handle) {
            handle.aclPacketsInQueue += packets;
        }
    }
    dispose() {
        if (this.socketTimer) {
            clearInterval(this.socketTimer);
            this.socketTimer = null;
        }
        if (this.socket) {
            this.socket.stop();
            this.socket.removeAllListeners();
            this.socket = null;
        }
        this.isSocketUp = false;
        this.mutex.cancel();
    }
    sendCommand(data, statusOnly, customMutex) {
        // Capture original scope of function call
        const origScope = new Error();
        const run = (release) => {
            // Our socket might have been disposed while waiting for the mutex
            if (!this.isSocketUp) {
                if (release) {
                    release();
                }
                throw new HciError_1.HciError('HCI socket not available');
            }
            return new Promise((resolve, reject) => {
                let timeout;
                const onComplete = (status, responseData) => {
                    var _a;
                    if (status !== 0) {
                        const errStatus = `${HciStatus_1.HciStatus[status]} (0x${status.toString(16).padStart(2, '0')})`;
                        rejectHandler(new HciError_1.HciError(`HCI Command ${(_a = this.currentCmd) === null || _a === void 0 ? void 0 : _a.cmd} failed`, errStatus));
                    }
                    else {
                        resolveHandler(responseData);
                    }
                };
                const cleanup = () => {
                    if (statusOnly) {
                        this.off('cmdStatus', onComplete);
                    }
                    else {
                        this.off('cmdComplete', onComplete);
                    }
                    if (timeout) {
                        clearTimeout(timeout);
                        timeout = null;
                    }
                    this.currentCmd = null;
                    if (release) {
                        release();
                    }
                };
                const resolveHandler = (response) => {
                    cleanup();
                    resolve(response);
                };
                const rejectHandler = (error) => {
                    if (error) {
                        error.stack = error.stack + '\n' + origScope.stack;
                    }
                    cleanup();
                    reject(error);
                };
                this.currentCmd = { cmd: data.readUInt16LE(1), data };
                if (statusOnly) {
                    this.once('cmdStatus', onComplete);
                }
                else {
                    this.once('cmdComplete', onComplete);
                }
                const timeoutError = new HciError_1.HciError(`HCI command timed out`);
                timeout = setTimeout(() => rejectHandler(timeoutError), this.cmdTimeout);
                // console.log('->', 'hci', data);
                this.socket.write(data);
            });
        };
        // Check if our socket is available
        if (!this.isSocketUp) {
            return Promise.reject('HCI socket not available');
        }
        if (customMutex) {
            return run(null);
        }
        else {
            return this.mutex.acquire().then((release) => run(release));
        }
    }
    setSocketFilter() {
        const filter = Buffer.alloc(14);
        const typeMask = (1 << Codes.HCI_COMMAND_PKT) | (1 << Codes.HCI_EVENT_PKT) | (1 << Codes.HCI_ACLDATA_PKT);
        const eventMask1 = (1 << Codes.EVT_DISCONN_COMPLETE) |
            (1 << Codes.EVT_ENCRYPT_CHANGE) |
            (1 << Codes.EVT_CMD_COMPLETE) |
            (1 << Codes.EVT_CMD_STATUS) |
            (1 << Codes.EVT_NUMBER_OF_COMPLETED_PACKETS);
        const eventMask2 = 1 << (Codes.EVT_LE_META_EVENT - 32);
        const opcode = 0;
        filter.writeUInt32LE(typeMask, 0);
        filter.writeUInt32LE(eventMask1, 4);
        filter.writeUInt32LE(eventMask2, 8);
        filter.writeUInt16LE(opcode, 12);
        this.socket.setFilter(filter);
    }
    setEventMask() {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = Buffer.alloc(12);
            const eventMask = Buffer.from('fffffbff07f8bf3d', 'hex');
            // header
            cmd.writeUInt8(Codes.HCI_COMMAND_PKT, 0);
            cmd.writeUInt16LE(Codes.SET_EVENT_MASK_CMD, 1);
            // length
            cmd.writeUInt8(eventMask.length, 3);
            eventMask.copy(cmd, 4);
            yield this.sendCommand(cmd);
        });
    }
    reset() {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = Buffer.alloc(4);
            // header
            cmd.writeUInt8(Codes.HCI_COMMAND_PKT, 0);
            cmd.writeUInt16LE(Codes.RESET_CMD, 1);
            // length
            cmd.writeUInt8(0x00, 3);
            yield this.sendCommand(cmd);
        });
    }
    readLocalVersion() {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = Buffer.alloc(4);
            // header
            cmd.writeUInt8(Codes.HCI_COMMAND_PKT, 0);
            cmd.writeUInt16LE(Codes.READ_LOCAL_VERSION_CMD, 1);
            // length
            cmd.writeUInt8(0x0, 3);
            const result = yield this.sendCommand(cmd);
            const hciVer = result.readUInt8(0);
            const hciRev = result.readUInt16LE(1);
            const lmpVer = result.readInt8(3);
            const manufacturer = result.readUInt16LE(4);
            const lmpSubVer = result.readUInt16LE(6);
            return { hciVer, hciRev, lmpVer, manufacturer, lmpSubVer };
        });
    }
    readBdAddr() {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = Buffer.alloc(4);
            // header
            cmd.writeUInt8(Codes.HCI_COMMAND_PKT, 0);
            cmd.writeUInt16LE(Codes.READ_BD_ADDR_CMD, 1);
            // length
            cmd.writeUInt8(0x0, 3);
            const result = yield this.sendCommand(cmd);
            this.addressType = 'public';
            this.address = result
                .toString('hex')
                .match(/.{1,2}/g)
                .reverse()
                .join(':')
                .toLowerCase();
        });
    }
    setLeEventMask() {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = Buffer.alloc(12);
            const leEventMask = Buffer.from('1f00000000000000', 'hex');
            // header
            cmd.writeUInt8(Codes.HCI_COMMAND_PKT, 0);
            cmd.writeUInt16LE(Codes.LE_SET_EVENT_MASK_CMD, 1);
            // length
            cmd.writeUInt8(leEventMask.length, 3);
            leEventMask.copy(cmd, 4);
            yield this.sendCommand(cmd);
        });
    }
    readLeHostSupported() {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = Buffer.alloc(4);
            // header
            cmd.writeUInt8(Codes.HCI_COMMAND_PKT, 0);
            cmd.writeUInt16LE(Codes.READ_LE_HOST_SUPPORTED_CMD, 1);
            // length
            cmd.writeUInt8(0x00, 3);
            const result = yield this.sendCommand(cmd);
            const le = result.readUInt8(0) === 0x01;
            const simul = result.readUInt8(1);
            return { le, simul };
        });
    }
    writeLeHostSupported() {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = Buffer.alloc(6);
            // header
            cmd.writeUInt8(Codes.HCI_COMMAND_PKT, 0);
            cmd.writeUInt16LE(Codes.WRITE_LE_HOST_SUPPORTED_CMD, 1);
            // length
            cmd.writeUInt8(0x02, 3);
            // data
            cmd.writeUInt8(0x01, 4); // le
            cmd.writeUInt8(0x00, 5); // simul
            yield this.sendCommand(cmd);
        });
    }
    setScanParameters() {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = Buffer.alloc(11);
            // header
            cmd.writeUInt8(Codes.HCI_COMMAND_PKT, 0);
            cmd.writeUInt16LE(Codes.LE_SET_SCAN_PARAMETERS_CMD, 1);
            // length
            cmd.writeUInt8(0x07, 3);
            // data
            cmd.writeUInt8(0x01, 4); // type: 0 -> passive, 1 -> active
            cmd.writeUInt16LE(0x0010, 5); // internal, ms * 1.6
            cmd.writeUInt16LE(0x0010, 7); // window, ms * 1.6
            cmd.writeUInt8(0x00, 9); // own address type: 0 -> public, 1 -> random
            cmd.writeUInt8(0x00, 10); // filter: 0 -> all event types
            yield this.sendCommand(cmd);
        });
    }
    setScanEnabled(enabled, filterDuplicates) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = Buffer.alloc(6);
            // header
            cmd.writeUInt8(Codes.HCI_COMMAND_PKT, 0);
            cmd.writeUInt16LE(Codes.LE_SET_SCAN_ENABLE_CMD, 1);
            // length
            cmd.writeUInt8(0x02, 3);
            // data
            cmd.writeUInt8(enabled ? 0x01 : 0x00, 4); // enable: 0 -> disabled, 1 -> enabled
            cmd.writeUInt8(filterDuplicates ? 0x01 : 0x00, 5); // duplicates: 0 -> yes, 1 -> no
            yield this.sendCommand(cmd);
        });
    }
    createLeConn(address, addressType, minInterval = 0x0006, maxInterval = 0x000c, latency = 0x0000, supervisionTimeout = 0x00c8) {
        address = address.toLowerCase();
        const cmd = Buffer.alloc(29);
        // header
        cmd.writeUInt8(Codes.HCI_COMMAND_PKT, 0);
        cmd.writeUInt16LE(Codes.LE_CREATE_CONN_CMD, 1);
        // length
        cmd.writeUInt8(0x19, 3);
        // data
        cmd.writeUInt16LE(0x0060, 4); // interval
        cmd.writeUInt16LE(0x0030, 6); // window
        cmd.writeUInt8(0x00, 8); // initiator filter
        cmd.writeUInt8(addressType === 'random' ? 0x01 : 0x00, 9); // peer address type
        Buffer.from(address.split(':').reverse().join(''), 'hex').copy(cmd, 10); // peer address
        cmd.writeUInt8(0x00, 16); // own address type
        cmd.writeUInt16LE(minInterval, 17); // min interval
        cmd.writeUInt16LE(maxInterval, 19); // max interval
        cmd.writeUInt16LE(latency, 21); // latency
        cmd.writeUInt16LE(supervisionTimeout, 23); // supervision timeout
        cmd.writeUInt16LE(0x0004, 25); // min ce length
        cmd.writeUInt16LE(0x0006, 27); // max ce length
        const origScope = new Error();
        const run = (release) => {
            return new Promise((resolve, reject) => {
                let timeout;
                const onComplete = (status, handle, role, _addressType, _address) => {
                    if (_address !== address || _addressType !== addressType) {
                        return;
                    }
                    if (status !== 0) {
                        const errStatus = `${HciStatus_1.HciStatus[status]} (0x${status.toString(16).padStart(2, '0')})`;
                        rejectHandler(new HciError_1.HciError(`LE conn failed`, errStatus));
                        return;
                    }
                    if (role !== 0) {
                        rejectHandler(new HciError_1.HciError(`Could not acquire le connection as master role`));
                        return;
                    }
                    resolveHandler(handle);
                };
                const cleanup = () => {
                    this.off('leConnComplete', onComplete);
                    if (timeout) {
                        clearTimeout(timeout);
                        timeout = null;
                    }
                    release();
                };
                const resolveHandler = (handle) => {
                    cleanup();
                    resolve(handle);
                };
                const rejectHandler = (error) => __awaiter(this, void 0, void 0, function* () {
                    cleanup();
                    try {
                        yield this.cancelLeConn(true);
                    }
                    catch (_a) {
                        // NO-OP
                    }
                    if (error) {
                        error.stack = error.stack + '\n' + origScope.stack;
                    }
                    reject(error);
                });
                this.on('leConnComplete', onComplete);
                const timeoutError = new HciError_1.HciError(`Creating connection timed out`);
                timeout = setTimeout(() => rejectHandler(timeoutError), 2 * this.cmdTimeout);
                this.sendCommand(cmd, true, true).catch((err) => rejectHandler(err));
            });
        };
        return this.mutex.acquire().then((release) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.cancelLeConn(true);
            }
            catch (_a) {
                // NO-OP
            }
            return run(release);
        }));
    }
    cancelLeConn(customMutex) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = Buffer.alloc(4);
            // header
            cmd.writeUInt8(Codes.HCI_COMMAND_PKT, 0);
            cmd.writeUInt16LE(Codes.LE_CANCEL_CONN_CMD, 1);
            // length
            cmd.writeUInt8(0x00, 3);
            yield this.sendCommand(cmd, false, customMutex);
        });
    }
    connUpdateLe(handle, minInterval, maxInterval, latency, supervisionTimeout) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = Buffer.alloc(18);
            // header
            cmd.writeUInt8(Codes.HCI_COMMAND_PKT, 0);
            cmd.writeUInt16LE(Codes.LE_CONN_UPDATE_CMD, 1);
            // length
            cmd.writeUInt8(0x0e, 3);
            // data
            cmd.writeUInt16LE(handle, 4);
            cmd.writeUInt16LE(Math.floor(minInterval / 1.25), 6); // min interval
            cmd.writeUInt16LE(Math.floor(maxInterval / 1.25), 8); // max interval
            cmd.writeUInt16LE(latency, 10); // latency
            cmd.writeUInt16LE(Math.floor(supervisionTimeout / 10), 12); // supervision timeout
            cmd.writeUInt16LE(0x0000, 14); // min ce length
            cmd.writeUInt16LE(0x0000, 16); // max ce length
            yield this.sendCommand(cmd, true);
        });
    }
    disconnect(handle, reason = Codes.HCI_OE_USER_ENDED_CONNECTION) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = Buffer.alloc(7);
            // header
            cmd.writeUInt8(Codes.HCI_COMMAND_PKT, 0);
            cmd.writeUInt16LE(Codes.DISCONNECT_CMD, 1);
            // length
            cmd.writeUInt8(0x03, 3);
            // data
            cmd.writeUInt16LE(handle, 4); // handle
            cmd.writeUInt8(reason, 6); // reason
            const origScope = new Error();
            return new Promise((resolve, reject) => {
                let timeout;
                const onComplete = (status, _handle) => {
                    if (_handle !== handle) {
                        return;
                    }
                    this.off('disconnectComplete', onComplete);
                    if (status !== 0) {
                        const errStatus = `${HciStatus_1.HciStatus[status]} (0x${status.toString(16).padStart(2, '0')})`;
                        rejectHandler(new HciError_1.HciError(`Disconnect failed`, errStatus));
                        return;
                    }
                    resolveHandler();
                };
                const cleanup = () => {
                    this.off('disconnectComplete', onComplete);
                    if (timeout) {
                        clearTimeout(timeout);
                        timeout = null;
                    }
                };
                const resolveHandler = () => {
                    cleanup();
                    resolve();
                };
                const rejectHandler = (error) => {
                    if (error) {
                        error.stack = error.stack + '\n' + origScope.stack;
                    }
                    cleanup();
                    reject(error);
                };
                this.on('disconnectComplete', onComplete);
                this.sendCommand(cmd, true).catch((err) => rejectHandler(err));
            });
        });
    }
    readRssi(handle) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = Buffer.alloc(6);
            // header
            cmd.writeUInt8(Codes.HCI_COMMAND_PKT, 0);
            cmd.writeUInt16LE(Codes.READ_RSSI_CMD, 1);
            // length
            cmd.writeUInt8(0x02, 3);
            // data
            cmd.writeUInt16LE(handle, 4); // handle
            const result = yield this.sendCommand(cmd);
            const rssi = result.readInt8(2);
            return rssi;
        });
    }
    writeAclDataPkt(handleId, cid, data) {
        if (!this.isSocketUp) {
            throw new HciError_1.HciError('HCI socket not available');
        }
        const handle = this.handles.get(handleId);
        if (!handle) {
            throw new HciError_1.HciError(`Could not write ACL data`, 'Unknown handle id');
        }
        //console.log('ACL', '<--', handleId, cid, data);
        let hf = handleId | (Codes.ACL_START_NO_FLUSH << 12);
        // l2cap PDU may be fragmented on hci level
        let l2capPdu = Buffer.alloc(4 + data.length);
        l2capPdu.writeUInt16LE(data.length, 0);
        l2capPdu.writeUInt16LE(cid, 2);
        data.copy(l2capPdu, 4);
        while (l2capPdu.length) {
            const frag = l2capPdu.slice(0, this.aclLeDataPacketLength);
            l2capPdu = l2capPdu.slice(frag.length);
            const pkt = Buffer.alloc(5 + frag.length);
            // hci header
            pkt.writeUInt8(Codes.HCI_ACLDATA_PKT, 0);
            pkt.writeUInt16LE(hf, 1);
            hf |= Codes.ACL_CONT << 12;
            pkt.writeUInt16LE(frag.length, 3); // hci pdu length
            frag.copy(pkt, 5);
            this.aclPacketQueue.push({ handle, pkt: pkt });
        }
        this.processAclPacketQueue();
    }
    processAclPacketQueue() {
        let inProgress = 0;
        for (const handle of this.handles.values()) {
            inProgress += handle.aclPacketsInQueue;
        }
        // We limit our packets to the max - 1, just to be safe. But we need at least 1 to send stuff
        // E.g. on linux the connection parameter update is handling automatically, so we need a spare slot for that packet
        const maxPackets = Math.max(1, this.totalNumAclLeDataPackets - 1);
        while (inProgress < maxPackets && this.aclPacketQueue.length > 0) {
            const { handle, pkt } = this.aclPacketQueue.shift();
            handle.aclPacketsInQueue++;
            inProgress++;
            this.socket.write(pkt);
        }
    }
    readBufferSize() {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = Buffer.alloc(4);
            // header
            cmd.writeUInt8(Codes.HCI_COMMAND_PKT, 0);
            cmd.writeUInt16LE(Codes.READ_BUFFER_SIZE_CMD, 1);
            // length
            cmd.writeUInt8(0x0, 3);
            const response = yield this.sendCommand(cmd);
            this.aclDataPacketLength = response.readUInt16LE(0);
            // const syncDataPacketLength = response.readInt8(2);
            this.totalNumAclDataPackets = response.readUInt16LE(3);
            // const totalNumSyncDataPackets = response.readUInt16LE(5);
        });
    }
    readLeBufferSize() {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = Buffer.alloc(4);
            // header
            cmd.writeUInt8(Codes.HCI_COMMAND_PKT, 0);
            cmd.writeUInt16LE(Codes.LE_READ_BUFFER_SIZE_CMD, 1);
            // length
            cmd.writeUInt8(0x0, 3);
            const response = yield this.sendCommand(cmd);
            this.aclLeDataPacketLength = response.readUInt16LE(0);
            if (this.aclLeDataPacketLength === 0) {
                this.aclLeDataPacketLength = this.aclDataPacketLength;
            }
            this.totalNumAclLeDataPackets = response.readUInt8(2);
            if (this.totalNumAclLeDataPackets === 0) {
                this.totalNumAclLeDataPackets = this.totalNumAclDataPackets;
            }
        });
    }
    setScanResponseData(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = Buffer.alloc(36);
            cmd.fill(0x00);
            // header
            cmd.writeUInt8(Codes.HCI_COMMAND_PKT, 0);
            cmd.writeUInt16LE(Codes.LE_SET_SCAN_RESPONSE_DATA_CMD, 1);
            // length
            cmd.writeUInt8(32, 3);
            // data
            cmd.writeUInt8(data.length, 4);
            data.copy(cmd, 5);
            yield this.sendCommand(cmd);
        });
    }
    setAdvertisingData(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = Buffer.alloc(36);
            cmd.fill(0x00);
            // header
            cmd.writeUInt8(Codes.HCI_COMMAND_PKT, 0);
            cmd.writeUInt16LE(Codes.LE_SET_ADVERTISING_DATA_CMD, 1);
            // length
            cmd.writeUInt8(32, 3);
            // data
            cmd.writeUInt8(data.length, 4);
            data.copy(cmd, 5);
            yield this.sendCommand(cmd);
        });
    }
    setAdvertisingEnabled(enabled) {
        return __awaiter(this, void 0, void 0, function* () {
            const cmd = Buffer.alloc(5);
            // header
            cmd.writeUInt8(Codes.HCI_COMMAND_PKT, 0);
            cmd.writeUInt16LE(Codes.LE_SET_ADVERTISE_ENABLE_CMD, 1);
            // length
            cmd.writeUInt8(0x01, 3);
            // data
            cmd.writeUInt8(enabled ? 0x01 : 0x00, 4); // enable: 0 -> disabled, 1 -> enabled
            yield this.sendCommand(cmd);
        });
    }
    handleEventPkt(data) {
        const eventType = data.readUInt8(0);
        // const length = data.readUInt8(1);
        const eventData = data.slice(2);
        this.emit(`hciEvent`, eventType, data);
        switch (eventType) {
            case Codes.EVT_DISCONN_COMPLETE:
                this.handleDisconnectPkt(eventData);
                break;
            case Codes.EVT_CMD_COMPLETE:
                this.handleCmdCompletePkt(eventData);
                break;
            case Codes.EVT_CMD_STATUS:
                this.handleCmdStatusPkt(eventData);
                break;
            case Codes.EVT_LE_META_EVENT:
                this.handleLeMetaEventPkt(eventData);
                break;
            case Codes.EVT_NUMBER_OF_COMPLETED_PACKETS:
                this.handleNumCompletedPktsPkt(eventData);
                break;
            case Codes.EVT_HARDWARE_ERROR:
                this.handleHardwareErrorPkt(eventData);
                break;
            default:
                break;
        }
    }
    handleDisconnectPkt(data) {
        const status = data.readUInt8(0);
        const handleId = data.readUInt16LE(1);
        const reason = data.readUInt8(3);
        /* As per Bluetooth Core specs:
            When the Host receives a Disconnection Complete, Disconnection Physical
            Link Complete or Disconnection Logical Link Complete event, the Host shall
            assume that all unacknowledged HCI Data Packets that have been sent to the
            Controller for the returned Handle have been flushed, and that the
            corresponding data buffers have been freed. */
        this.handles.delete(handleId);
        // Remove all pending packets for this handle from the queue
        this.aclPacketQueue = this.aclPacketQueue.filter(({ handle }) => handle.id !== handleId);
        const reasonStr = `${HciStatus_1.HciStatus[reason]} (0x${reason.toString(16).padStart(2, '0')})`;
        this.emit('disconnectComplete', status, handleId, reasonStr);
        // Process acl packet queue because we may have more space now
        this.processAclPacketQueue();
    }
    handleCmdCompletePkt(data) {
        // const completeNumHciCommands = data.readUInt8(2);
        const cmd = data.readUInt16LE(1);
        const status = data.readUInt8(3);
        const result = data.slice(4);
        if (cmd === 0x00 && status === 0x00) {
            // This event is generated when the controller was busy and is now ready to receive commands again
            return;
        }
        if (this.currentCmd && this.currentCmd.cmd === cmd) {
            this.emit('cmdComplete', status, result);
        }
    }
    handleCmdStatusPkt(data) {
        const status = data.readUInt8(0);
        // const statusNumHciCommands = data.readUInt8(1);
        const cmd = data.readUInt16LE(2);
        if (status === 0x00 && cmd === 0x00) {
            // This event is generated when the controller was busy and is now ready to receive commands again
            return;
        }
        if (this.currentCmd && this.currentCmd.cmd === cmd) {
            // Only report if the status concerns the command we issued
            this.emit('cmdStatus', status);
        }
    }
    handleLeMetaEventPkt(data) {
        const eventType = data.readUInt8(0);
        const eventStatus = data.readUInt8(1);
        const eventData = data.slice(2);
        switch (eventType) {
            case Codes.EVT_LE_ADVERTISING_REPORT:
                this.handleLeAdvertisingReportEvent(eventStatus, eventData);
                break;
            case Codes.EVT_LE_CONN_COMPLETE:
                this.handleLeConnCompleteEvent(eventStatus, eventData);
                break;
            case Codes.EVT_LE_CONN_UPDATE_COMPLETE:
                this.handleLeConnUpdateEvent(eventStatus, eventData);
                break;
            default:
                break;
        }
    }
    handleLeConnCompleteEvent(status, data) {
        const handleId = data.readUInt16LE(0);
        const role = data.readUInt8(2);
        const addressType = data.readUInt8(3) === 0x01 ? 'random' : 'public';
        const address = data
            .slice(4, 10)
            .toString('hex')
            .match(/.{1,2}/g)
            .reverse()
            .join(':')
            .toLowerCase();
        const interval = data.readUInt16LE(10) * 1.25;
        const latency = data.readUInt16LE(12);
        const supervisionTimeout = data.readUInt16LE(14) * 10;
        // const masterClockAccuracy = data.readUInt8(16);
        const handle = this.handles.get(handleId);
        if (!handle) {
            this.handles.set(handleId, {
                id: handleId,
                interval,
                latency,
                supervisionTimeout,
                aclPacketsInQueue: 0,
                buffer: null
            });
        }
        else {
            handle.interval = interval;
            handle.latency = latency;
            handle.supervisionTimeout = supervisionTimeout;
        }
        this.emit('leConnComplete', status, handleId, role, addressType, address, interval, latency, supervisionTimeout);
    }
    handleLeConnUpdateEvent(status, data) {
        const handleId = data.readUInt16LE(0);
        const interval = data.readUInt16LE(2) * 1.25;
        const latency = data.readUInt16LE(4);
        const supervisionTimeout = data.readUInt16LE(6) * 10;
        const handle = this.handles.get(handleId);
        if (!handle) {
            this.emit('hciError', new HciError_1.HciError(`Received connection update packet for unknown handle ${handleId}`));
        }
        if (status === 0) {
            handle.interval = interval;
            handle.latency = latency;
            handle.supervisionTimeout = supervisionTimeout;
        }
        this.emit('leConnUpdate', status, handleId, interval, latency, supervisionTimeout);
    }
    handleLeAdvertisingReportEvent(count, data) {
        try {
            for (let i = 0; i < count; i++) {
                const type = data.readUInt8(0);
                const addressType = data.readUInt8(1) === 0x01 ? 'random' : 'public';
                const address = data
                    .slice(2, 8)
                    .toString('hex')
                    .match(/.{1,2}/g)
                    .reverse()
                    .join(':')
                    .toLowerCase();
                const eirLength = data.readUInt8(8);
                const eir = data.slice(9, eirLength + 9);
                const rssi = data.readInt8(eirLength + 9);
                this.emit('leAdvertisingReport', type, address, addressType, eir, rssi);
                data = data.slice(eirLength + 10);
            }
        }
        catch (_a) {
            // TODO
        }
    }
    handleNumCompletedPktsPkt(data) {
        const numHandles = data.readUInt8(0);
        for (let i = 0; i < numHandles; i++) {
            const targetHandleId = data.readUInt16LE(1 + i * 4);
            const targetNumPackets = data.readUInt16LE(1 + i * 4 + 2);
            const targetHandle = this.handles.get(targetHandleId);
            if (!targetHandle) {
                continue;
            }
            // We may receive completed events for packets that were sent before our application was started
            // so clamp the value to [0-inf)
            targetHandle.aclPacketsInQueue = Math.max(0, targetHandle.aclPacketsInQueue - targetNumPackets);
        }
        // Process the packet queue because we may have more space now
        this.processAclPacketQueue();
    }
    handleHardwareErrorPkt(data) {
        const errorCode = data.readUInt8(0);
        this.emit('hciError', new HciError_1.HciError(`Hardware error`, `${errorCode}`));
    }
    handleAclDataPkt(data) {
        const flags = data.readUInt16LE(0) >> 12;
        const handleId = data.readUInt16LE(0) & 0x0fff;
        let handle = this.handles.get(handleId);
        if (!handle) {
            handle = {
                id: handleId,
                interval: 0,
                latency: 0,
                supervisionTimeout: 0,
                aclPacketsInQueue: 0,
                buffer: null
            };
            this.handles.set(handleId, handle);
        }
        if (Codes.ACL_START === flags) {
            const length = data.readUInt16LE(4);
            const cid = data.readUInt16LE(6);
            const pktData = data.slice(8);
            if (length === pktData.length) {
                //console.log('ACL', '-->', handleId, cid, pktData);
                this.emit('aclDataPkt', handleId, cid, pktData);
            }
            else {
                handle.buffer = {
                    length: length,
                    cid: cid,
                    data: pktData
                };
            }
        }
        else if (Codes.ACL_CONT === flags) {
            const buff = handle.buffer;
            if (!buff || !buff.data) {
                return;
            }
            buff.data = Buffer.concat([buff.data, data.slice(4)]);
            if (buff.data.length === buff.length) {
                //console.log('ACL', '-->', handleId, buff.cid, buff.data);
                this.emit('aclDataPkt', handleId, buff.cid, buff.data);
                handle.buffer = null;
            }
        }
    }
    handleCmdPkt(data) {
        const cmd = data.readUInt16LE(0);
        // const len = data.readUInt8(2);
        switch (cmd) {
            case Codes.LE_SET_SCAN_ENABLE_CMD:
                this.handleSetScanEnablePkt(data);
                break;
            case Codes.LE_SET_ADVERTISE_ENABLE_CMD:
                this.handleSetAdvertiseEnablePkt(data);
                break;
            default:
                break;
        }
    }
    handleSetScanEnablePkt(data) {
        const scanEnabled = data.readUInt8(3) === 0x1;
        const filterDuplicates = data.readUInt8(4) === 0x1;
        this.emit('leScanEnable', scanEnabled, filterDuplicates);
    }
    handleSetAdvertiseEnablePkt(data) {
        const advertiseEnabled = data.readUInt8(3) === 0x1;
        this.emit('leAdvertiseEnable', advertiseEnabled);
    }
}
exports.Hci = Hci;
//# sourceMappingURL=Hci.js.map