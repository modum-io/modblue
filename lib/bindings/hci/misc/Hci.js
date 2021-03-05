"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hci = void 0;
const async_mutex_1 = require("async-mutex");
const tiny_typed_emitter_1 = require("tiny-typed-emitter");
const hci_status_json_1 = __importDefault(require("./hci-status.json"));
const HciError_1 = require("./HciError");
// tslint:disable-next-line: variable-name
const BluetoothHciSocket = require('@abandonware/bluetooth-hci-socket');
// tslint:disable: no-bitwise
const HCI_COMMAND_PKT = 0x01;
const HCI_ACLDATA_PKT = 0x02;
const HCI_EVENT_PKT = 0x04;
const ACL_START_NO_FLUSH = 0x00;
const ACL_CONT = 0x01;
const ACL_START = 0x02;
const EVT_DISCONN_COMPLETE = 0x05;
const EVT_ENCRYPT_CHANGE = 0x08;
const EVT_QOS_COMPLETE = 0x0d;
const EVT_CMD_COMPLETE = 0x0e;
const EVT_CMD_STATUS = 0x0f;
const EVT_HARDWARE_ERROR = 0x10;
const EVT_NUMBER_OF_COMPLETED_PACKETS = 0x13;
const EVT_LE_META_EVENT = 0x3e;
const EVT_LE_CONN_COMPLETE = 0x01;
const EVT_LE_ADVERTISING_REPORT = 0x02;
const EVT_LE_CONN_UPDATE_COMPLETE = 0x03;
const EVT_LE_READ_REMOTE_FEATURES_COMPLETE = 0x04;
const OGF_LINK_CTL = 0x01;
const OCF_DISCONNECT = 0x0006;
const OGF_HOST_CTL = 0x03;
const OCF_SET_EVENT_MASK = 0x0001;
const OCF_RESET = 0x0003;
const OCF_READ_LE_HOST_SUPPORTED = 0x006c;
const OCF_WRITE_LE_HOST_SUPPORTED = 0x006d;
const OGF_INFO_PARAM = 0x04;
const OCF_READ_LOCAL_VERSION = 0x0001;
const OCF_READ_BUFER_SIZE = 0x0005;
const OCF_READ_BD_ADDR = 0x0009;
const OGF_STATUS_PARAM = 0x05;
const OCF_READ_RSSI = 0x0005;
const OGF_LE_CTL = 0x08;
const OCF_LE_SET_EVENT_MASK = 0x0001;
const OCF_LE_READ_BUFFER_SIZE = 0x0002;
const OCF_LE_SET_ADVERTISING_PARAMETERS = 0x0006;
const OCF_LE_SET_ADVERTISING_DATA = 0x0008;
const OCF_LE_SET_SCAN_RESPONSE_DATA = 0x0009;
const OCF_LE_SET_ADVERTISE_ENABLE = 0x000a;
const OCF_LE_SET_SCAN_PARAMETERS = 0x000b;
const OCF_LE_SET_SCAN_ENABLE = 0x000c;
const OCF_LE_CREATE_CONN = 0x000d;
const OCF_LE_CANCEL_CONN = 0x000e;
const OCF_LE_CONN_UPDATE = 0x0013;
const OCF_LE_START_ENCRYPTION = 0x0019;
const OCF_LE_LTK_NEG_REPLY = 0x001b;
const DISCONNECT_CMD = OCF_DISCONNECT | (OGF_LINK_CTL << 10);
const SET_EVENT_MASK_CMD = OCF_SET_EVENT_MASK | (OGF_HOST_CTL << 10);
const RESET_CMD = OCF_RESET | (OGF_HOST_CTL << 10);
const READ_LE_HOST_SUPPORTED_CMD = OCF_READ_LE_HOST_SUPPORTED | (OGF_HOST_CTL << 10);
const WRITE_LE_HOST_SUPPORTED_CMD = OCF_WRITE_LE_HOST_SUPPORTED | (OGF_HOST_CTL << 10);
const READ_LOCAL_VERSION_CMD = OCF_READ_LOCAL_VERSION | (OGF_INFO_PARAM << 10);
const READ_BUFFER_SIZE_CMD = OCF_READ_BUFER_SIZE | (OGF_INFO_PARAM << 10);
const READ_BD_ADDR_CMD = OCF_READ_BD_ADDR | (OGF_INFO_PARAM << 10);
const READ_RSSI_CMD = OCF_READ_RSSI | (OGF_STATUS_PARAM << 10);
const LE_SET_EVENT_MASK_CMD = OCF_LE_SET_EVENT_MASK | (OGF_LE_CTL << 10);
const LE_SET_SCAN_PARAMETERS_CMD = OCF_LE_SET_SCAN_PARAMETERS | (OGF_LE_CTL << 10);
const LE_SET_SCAN_ENABLE_CMD = OCF_LE_SET_SCAN_ENABLE | (OGF_LE_CTL << 10);
const LE_CREATE_CONN_CMD = OCF_LE_CREATE_CONN | (OGF_LE_CTL << 10);
const LE_CANCEL_CONN_CMD = OCF_LE_CANCEL_CONN | (OGF_LE_CTL << 10);
const LE_CONN_UPDATE_CMD = OCF_LE_CONN_UPDATE | (OGF_LE_CTL << 10);
const LE_START_ENCRYPTION_CMD = OCF_LE_START_ENCRYPTION | (OGF_LE_CTL << 10);
const LE_READ_BUFFER_SIZE_CMD = OCF_LE_READ_BUFFER_SIZE | (OGF_LE_CTL << 10);
const LE_SET_ADVERTISING_PARAMETERS_CMD = OCF_LE_SET_ADVERTISING_PARAMETERS | (OGF_LE_CTL << 10);
const LE_SET_ADVERTISING_DATA_CMD = OCF_LE_SET_ADVERTISING_DATA | (OGF_LE_CTL << 10);
const LE_SET_SCAN_RESPONSE_DATA_CMD = OCF_LE_SET_SCAN_RESPONSE_DATA | (OGF_LE_CTL << 10);
const LE_SET_ADVERTISE_ENABLE_CMD = OCF_LE_SET_ADVERTISE_ENABLE | (OGF_LE_CTL << 10);
const LE_LTK_NEG_REPLY_CMD = OCF_LE_LTK_NEG_REPLY | (OGF_LE_CTL << 10);
const HCI_OE_USER_ENDED_CONNECTION = 0x13;
const HCI_CMD_TIMEOUT = 10000; // in milliseconds
class Hci extends tiny_typed_emitter_1.TypedEmitter {
    constructor(deviceId, cmdTimeout = HCI_CMD_TIMEOUT) {
        super();
        this.aclPacketQueue = [];
        this.checkSocketState = async () => {
            const isUp = this.socket && this.socket.isDevUp();
            if (isUp !== this.isSocketUp) {
                // If the hci socket state changed the initialize or cleanup our connection
                this.isSocketUp = isUp;
                if (isUp) {
                    // Socket is now up
                    this.setSocketFilter();
                    await this.reset();
                    if (this.state === 'unauthorized') {
                        throw new HciError_1.HciError('Not authorized');
                    }
                    await this.setEventMask();
                    await this.setLeEventMask();
                    const { hciVer, hciRev } = await this.readLocalVersion();
                    this.hciVersion = hciVer;
                    this.hciRevision = hciRev;
                    if (hciVer < 0x06) {
                        throw new HciError_1.HciError(`HCI version ${hciVer}.${hciRev} not supported`);
                    }
                    await this.writeLeHostSupported();
                    await this.readLeHostSupported();
                    await this.readBufferSize();
                    await this.readLeBufferSize();
                    await this.readBdAddr();
                    this.isProcessingAclQueue = false;
                    this.state = 'poweredOn';
                    this.emit('stateChange', this.state);
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
        };
        this.onSocketData = (data) => {
            const eventType = data.readUInt8(0);
            const eventData = data.slice(1);
            // console.log('<-', 'hci', data);
            switch (eventType) {
                case HCI_EVENT_PKT:
                    this.handleEventPkt(eventData);
                    break;
                case HCI_ACLDATA_PKT:
                    this.handleAclDataPkt(eventData);
                    break;
                case HCI_COMMAND_PKT:
                    this.handleCmdPkt(eventData);
                    break;
                default:
                    break;
            }
        };
        this.onSocketError = (error) => {
            if (error.code === 'EPERM') {
                this.state = 'unauthorized';
                this.emit('stateChange', this.state);
            }
            else if (error.message === 'Network is down') {
                // no-op
            }
        };
        this.state = 'poweredOff';
        this.deviceId = deviceId;
        // We attach about 6 listeners per connected device
        // 5 connected devices + 10 spare
        this.setMaxListeners(40);
        this.handles = new Map();
        this.cmdTimeout = cmdTimeout;
        this.mutex = async_mutex_1.withTimeout(new async_mutex_1.Mutex(), this.cmdTimeout, new HciError_1.HciError(`HCI command mutex timeout`));
        this.currentCmd = null;
    }
    static getDeviceList() {
        const socket = new BluetoothHciSocket();
        return socket.getDeviceList();
    }
    async acquireMutex() {
        var _a;
        try {
            const release = await this.mutex.acquire();
            this.mutexStack = new Error();
            return release;
        }
        catch (_b) {
            throw new HciError_1.HciError(`Could not acquire HCI command mutex`, (_a = this.mutexStack) === null || _a === void 0 ? void 0 : _a.stack);
        }
    }
    async init() {
        this.socket = new BluetoothHciSocket();
        this.socket.on('data', this.onSocketData);
        this.socket.on('error', this.onSocketError);
        this.deviceId = this.socket.bindRaw(this.deviceId);
        this.socket.start();
        await this.checkSocketState();
        this.socketTimer = setInterval(this.checkSocketState, 1000);
        for (let i = 0; i < 5; i++) {
            if (this.isSocketUp) {
                break;
            }
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        if (!this.isSocketUp) {
            throw new HciError_1.HciError(`Initializing socket timed out - Are you sure it's running?`, `On unix try \`sudo hciconfig hci${this.deviceId} up\``);
        }
    }
    dispose() {
        if (this.socketTimer) {
            clearInterval(this.socketTimer);
            this.socketTimer = null;
        }
        this.isSocketUp = false;
        this.socket.stop();
        this.socket.removeAllListeners();
        this.socket = null;
        this.mutex.cancel();
    }
    async sendCommand(data, statusOnly, customMutex) {
        // Check if our socket is available
        if (!this.isSocketUp) {
            throw new HciError_1.HciError('HCI socket not available');
        }
        const release = customMutex ? null : await this.acquireMutex();
        // Our socket might have been disposed while waiting for the mutex
        if (!this.isSocketUp) {
            if (release) {
                release();
            }
            throw new HciError_1.HciError('HCI socket not available');
        }
        const origScope = new Error();
        return new Promise((resolve, reject) => {
            let timeout;
            let onComplete;
            const cleanup = () => {
                if (statusOnly) {
                    this.off('cmdStatus', onComplete);
                }
                else {
                    this.off('cmdComplete', onComplete);
                }
                this.mutexStack = null;
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
            onComplete = (status, responseData) => {
                if (status !== 0) {
                    const errStatus = `${hci_status_json_1.default[status]} (0x${status.toString(16).padStart(2, '0')})`;
                    rejectHandler(new HciError_1.HciError(`HCI Command ${this.currentCmd.cmd} failed`, errStatus));
                }
                else {
                    resolveHandler(responseData);
                }
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
    }
    setSocketFilter() {
        const filter = Buffer.alloc(14);
        const typeMask = (1 << HCI_COMMAND_PKT) | (1 << HCI_EVENT_PKT) | (1 << HCI_ACLDATA_PKT);
        const eventMask1 = (1 << EVT_DISCONN_COMPLETE) |
            (1 << EVT_ENCRYPT_CHANGE) |
            (1 << EVT_CMD_COMPLETE) |
            (1 << EVT_CMD_STATUS) |
            (1 << EVT_NUMBER_OF_COMPLETED_PACKETS);
        const eventMask2 = 1 << (EVT_LE_META_EVENT - 32);
        const opcode = 0;
        filter.writeUInt32LE(typeMask, 0);
        filter.writeUInt32LE(eventMask1, 4);
        filter.writeUInt32LE(eventMask2, 8);
        filter.writeUInt16LE(opcode, 12);
        this.socket.setFilter(filter);
    }
    async setEventMask() {
        const cmd = Buffer.alloc(12);
        const eventMask = Buffer.from('fffffbff07f8bf3d', 'hex');
        // header
        cmd.writeUInt8(HCI_COMMAND_PKT, 0);
        cmd.writeUInt16LE(SET_EVENT_MASK_CMD, 1);
        // length
        cmd.writeUInt8(eventMask.length, 3);
        eventMask.copy(cmd, 4);
        await this.sendCommand(cmd);
    }
    async reset() {
        const cmd = Buffer.alloc(4);
        // header
        cmd.writeUInt8(HCI_COMMAND_PKT, 0);
        cmd.writeUInt16LE(RESET_CMD, 1);
        // length
        cmd.writeUInt8(0x00, 3);
        await this.sendCommand(cmd);
    }
    async readLocalVersion() {
        const cmd = Buffer.alloc(4);
        // header
        cmd.writeUInt8(HCI_COMMAND_PKT, 0);
        cmd.writeUInt16LE(READ_LOCAL_VERSION_CMD, 1);
        // length
        cmd.writeUInt8(0x0, 3);
        const result = await this.sendCommand(cmd);
        const hciVer = result.readUInt8(0);
        const hciRev = result.readUInt16LE(1);
        const lmpVer = result.readInt8(3);
        const manufacturer = result.readUInt16LE(4);
        const lmpSubVer = result.readUInt16LE(6);
        return { hciVer, hciRev, lmpVer, manufacturer, lmpSubVer };
    }
    async readBdAddr() {
        const cmd = Buffer.alloc(4);
        // header
        cmd.writeUInt8(HCI_COMMAND_PKT, 0);
        cmd.writeUInt16LE(READ_BD_ADDR_CMD, 1);
        // length
        cmd.writeUInt8(0x0, 3);
        const result = await this.sendCommand(cmd);
        this.addressType = 'public';
        this.address = result
            .toString('hex')
            .match(/.{1,2}/g)
            .reverse()
            .join(':');
    }
    async setLeEventMask() {
        const cmd = Buffer.alloc(12);
        const leEventMask = Buffer.from('1f00000000000000', 'hex');
        // header
        cmd.writeUInt8(HCI_COMMAND_PKT, 0);
        cmd.writeUInt16LE(LE_SET_EVENT_MASK_CMD, 1);
        // length
        cmd.writeUInt8(leEventMask.length, 3);
        leEventMask.copy(cmd, 4);
        await this.sendCommand(cmd);
    }
    async readLeHostSupported() {
        const cmd = Buffer.alloc(4);
        // header
        cmd.writeUInt8(HCI_COMMAND_PKT, 0);
        cmd.writeUInt16LE(READ_LE_HOST_SUPPORTED_CMD, 1);
        // length
        cmd.writeUInt8(0x00, 3);
        const result = await this.sendCommand(cmd);
        const le = result.readUInt8(0) === 0x01;
        const simul = result.readUInt8(1);
        return { le, simul };
    }
    async writeLeHostSupported() {
        const cmd = Buffer.alloc(6);
        // header
        cmd.writeUInt8(HCI_COMMAND_PKT, 0);
        cmd.writeUInt16LE(WRITE_LE_HOST_SUPPORTED_CMD, 1);
        // length
        cmd.writeUInt8(0x02, 3);
        // data
        cmd.writeUInt8(0x01, 4); // le
        cmd.writeUInt8(0x00, 5); // simul
        await this.sendCommand(cmd);
    }
    async setScanParameters() {
        const cmd = Buffer.alloc(11);
        // header
        cmd.writeUInt8(HCI_COMMAND_PKT, 0);
        cmd.writeUInt16LE(LE_SET_SCAN_PARAMETERS_CMD, 1);
        // length
        cmd.writeUInt8(0x07, 3);
        // data
        cmd.writeUInt8(0x01, 4); // type: 0 -> passive, 1 -> active
        cmd.writeUInt16LE(0x0010, 5); // internal, ms * 1.6
        cmd.writeUInt16LE(0x0010, 7); // window, ms * 1.6
        cmd.writeUInt8(0x00, 9); // own address type: 0 -> public, 1 -> random
        cmd.writeUInt8(0x00, 10); // filter: 0 -> all event types
        await this.sendCommand(cmd);
    }
    async setScanEnabled(enabled, filterDuplicates) {
        const cmd = Buffer.alloc(6);
        // header
        cmd.writeUInt8(HCI_COMMAND_PKT, 0);
        cmd.writeUInt16LE(LE_SET_SCAN_ENABLE_CMD, 1);
        // length
        cmd.writeUInt8(0x02, 3);
        // data
        cmd.writeUInt8(enabled ? 0x01 : 0x00, 4); // enable: 0 -> disabled, 1 -> enabled
        cmd.writeUInt8(filterDuplicates ? 0x01 : 0x00, 5); // duplicates: 0 -> yes, 1 -> no
        await this.sendCommand(cmd);
    }
    async createLeConn(address, addressType, minInterval = 0x0006, maxInterval = 0x000c, latency = 0x0000, supervisionTimeout = 0x00c8) {
        address = address.toUpperCase();
        const cmd = Buffer.alloc(29);
        // header
        cmd.writeUInt8(HCI_COMMAND_PKT, 0);
        cmd.writeUInt16LE(LE_CREATE_CONN_CMD, 1);
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
        const release = await this.acquireMutex();
        try {
            await this.cancelLeConn(true);
        }
        catch (_a) {
            // NO-OP
        }
        const origScope = new Error();
        return new Promise((resolve, reject) => {
            let timeout;
            let onComplete;
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
            const rejectHandler = async (error) => {
                cleanup();
                try {
                    await this.cancelLeConn(true);
                }
                catch (_a) {
                    // NO-OP
                }
                if (error) {
                    error.stack = error.stack + '\n' + origScope.stack;
                }
                reject(error);
            };
            onComplete = async (status, handle, role, _addressType, _address) => {
                if (_address !== address || _addressType !== addressType) {
                    return;
                }
                this.off('leConnComplete', onComplete);
                if (status !== 0) {
                    const errStatus = `${hci_status_json_1.default[status]} (0x${status.toString(16).padStart(2, '0')})`;
                    await rejectHandler(new HciError_1.HciError(`LE conn failed`, errStatus));
                    return;
                }
                if (role !== 0) {
                    await rejectHandler(new HciError_1.HciError(`Could not acquire le connection as master role`));
                    return;
                }
                resolveHandler(handle);
            };
            this.on('leConnComplete', onComplete);
            const timeoutError = new HciError_1.HciError(`Creating connection timed out`);
            timeout = setTimeout(() => rejectHandler(timeoutError), 2 * this.cmdTimeout);
            this.sendCommand(cmd, true, true).catch((err) => rejectHandler(err));
        });
    }
    async cancelLeConn(customMutex) {
        const cmd = Buffer.alloc(4);
        // header
        cmd.writeUInt8(HCI_COMMAND_PKT, 0);
        cmd.writeUInt16LE(LE_CANCEL_CONN_CMD, 1);
        // length
        cmd.writeUInt8(0x00, 3);
        await this.sendCommand(cmd, false, customMutex);
    }
    async connUpdateLe(handle, minInterval, maxInterval, latency, supervisionTimeout) {
        const cmd = Buffer.alloc(18);
        // header
        cmd.writeUInt8(HCI_COMMAND_PKT, 0);
        cmd.writeUInt16LE(LE_CONN_UPDATE_CMD, 1);
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
        await this.sendCommand(cmd, true);
    }
    async disconnect(handle, reason = HCI_OE_USER_ENDED_CONNECTION) {
        const cmd = Buffer.alloc(7);
        // header
        cmd.writeUInt8(HCI_COMMAND_PKT, 0);
        cmd.writeUInt16LE(DISCONNECT_CMD, 1);
        // length
        cmd.writeUInt8(0x03, 3);
        // data
        cmd.writeUInt16LE(handle, 4); // handle
        cmd.writeUInt8(reason, 6); // reason
        const origScope = new Error();
        return new Promise((resolve, reject) => {
            let timeout;
            let onComplete;
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
            onComplete = (status, _handle, _reason) => {
                if (_handle !== handle) {
                    return;
                }
                this.off('disconnectComplete', onComplete);
                if (status !== 0) {
                    const errStatus = `${hci_status_json_1.default[status]} (0x${status.toString(16).padStart(2, '0')})`;
                    rejectHandler(new HciError_1.HciError(`Disconnect failed`, errStatus));
                    return;
                }
                resolveHandler();
            };
            this.on('disconnectComplete', onComplete);
            this.sendCommand(cmd, true).catch((err) => rejectHandler(err));
        });
    }
    async readRssi(handle) {
        const cmd = Buffer.alloc(6);
        // header
        cmd.writeUInt8(HCI_COMMAND_PKT, 0);
        cmd.writeUInt16LE(READ_RSSI_CMD, 1);
        // length
        cmd.writeUInt8(0x02, 3);
        // data
        cmd.writeUInt16LE(handle, 4); // handle
        const result = await this.sendCommand(cmd);
        const rssi = result.readInt8(2);
        return rssi;
    }
    writeAclDataPkt(handleId, cid, data) {
        if (!this.isSocketUp) {
            throw new HciError_1.HciError('HCI socket not available');
        }
        const handle = this.handles.get(handleId);
        if (!handle) {
            throw new HciError_1.HciError(`Could not write ACL data`, 'Unknown handle id');
        }
        let hf = handleId | (ACL_START_NO_FLUSH << 12);
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
            pkt.writeUInt8(HCI_ACLDATA_PKT, 0);
            pkt.writeUInt16LE(hf, 1);
            hf |= ACL_CONT << 12;
            pkt.writeUInt16LE(frag.length, 3); // hci pdu length
            frag.copy(pkt, 5);
            this.aclPacketQueue.push({ handle, pkt: pkt });
        }
        this.processAclPacketQueue();
    }
    processAclPacketQueue() {
        if (this.isProcessingAclQueue) {
            return;
        }
        this.isProcessingAclQueue = true;
        let inProgress = 0;
        for (const handle of this.handles.values()) {
            inProgress += handle.aclPacketsInQueue;
        }
        while (inProgress < this.totalNumAclLeDataPackets && this.aclPacketQueue.length > 0) {
            const { handle, pkt } = this.aclPacketQueue.shift();
            handle.aclPacketsInQueue++;
            inProgress++;
            this.socket.write(pkt);
        }
        this.isProcessingAclQueue = false;
    }
    async readBufferSize() {
        const cmd = Buffer.alloc(4);
        // header
        cmd.writeUInt8(HCI_COMMAND_PKT, 0);
        cmd.writeUInt16LE(READ_BUFFER_SIZE_CMD, 1);
        // length
        cmd.writeUInt8(0x0, 3);
        const response = await this.sendCommand(cmd);
        this.aclDataPacketLength = response.readUInt16LE(0);
        // const syncDataPacketLength = response.readInt8(2);
        this.totalNumAclDataPackets = response.readUInt16LE(3);
        // const totalNumSyncDataPackets = response.readUInt16LE(5);
    }
    async readLeBufferSize() {
        const cmd = Buffer.alloc(4);
        // header
        cmd.writeUInt8(HCI_COMMAND_PKT, 0);
        cmd.writeUInt16LE(LE_READ_BUFFER_SIZE_CMD, 1);
        // length
        cmd.writeUInt8(0x0, 3);
        const response = await this.sendCommand(cmd);
        this.aclLeDataPacketLength = response.readUInt16LE(0);
        if (this.aclLeDataPacketLength === 0) {
            this.aclLeDataPacketLength = this.aclDataPacketLength;
        }
        this.totalNumAclLeDataPackets = response.readUInt8(2);
        if (this.totalNumAclLeDataPackets === 0) {
            this.totalNumAclLeDataPackets = this.totalNumAclDataPackets;
        }
    }
    async setScanResponseData(data) {
        const cmd = Buffer.alloc(36);
        cmd.fill(0x00);
        // header
        cmd.writeUInt8(HCI_COMMAND_PKT, 0);
        cmd.writeUInt16LE(LE_SET_SCAN_RESPONSE_DATA_CMD, 1);
        // length
        cmd.writeUInt8(32, 3);
        // data
        cmd.writeUInt8(data.length, 4);
        data.copy(cmd, 5);
        await this.sendCommand(cmd);
    }
    async setAdvertisingData(data) {
        const cmd = Buffer.alloc(36);
        cmd.fill(0x00);
        // header
        cmd.writeUInt8(HCI_COMMAND_PKT, 0);
        cmd.writeUInt16LE(LE_SET_ADVERTISING_DATA_CMD, 1);
        // length
        cmd.writeUInt8(32, 3);
        // data
        cmd.writeUInt8(data.length, 4);
        data.copy(cmd, 5);
        await this.sendCommand(cmd);
    }
    async setAdvertisingEnabled(enabled) {
        const cmd = Buffer.alloc(5);
        // header
        cmd.writeUInt8(HCI_COMMAND_PKT, 0);
        cmd.writeUInt16LE(LE_SET_ADVERTISE_ENABLE_CMD, 1);
        // length
        cmd.writeUInt8(0x01, 3);
        // data
        cmd.writeUInt8(enabled ? 0x01 : 0x00, 4); // enable: 0 -> disabled, 1 -> enabled
        await this.sendCommand(cmd);
    }
    handleEventPkt(data) {
        const eventType = data.readUInt8(0);
        // const length = data.readUInt8(1);
        const eventData = data.slice(2);
        this.emit(`hciEvent`, eventType, data);
        switch (eventType) {
            case EVT_DISCONN_COMPLETE:
                this.handleDisconnectPkt(eventData);
                break;
            case EVT_CMD_COMPLETE:
                this.handleCmdCompletePkt(eventData);
                break;
            case EVT_CMD_STATUS:
                this.handleCmdStatusPkt(eventData);
                break;
            case EVT_LE_META_EVENT:
                this.handleLeMetaEventPkt(eventData);
                break;
            case EVT_NUMBER_OF_COMPLETED_PACKETS:
                this.handleNumCompletedPktsPkt(eventData);
                break;
            case EVT_HARDWARE_ERROR:
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
        const reasonStr = `${hci_status_json_1.default[reason]} (0x${reason.toString(16).padStart(2, '0')})`;
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
            case EVT_LE_ADVERTISING_REPORT:
                this.handleLeAdvertisingReportEvent(eventStatus, eventData);
                break;
            case EVT_LE_CONN_COMPLETE:
                this.handleLeConnCompleteEvent(eventStatus, eventData);
                break;
            case EVT_LE_CONN_UPDATE_COMPLETE:
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
            .toUpperCase();
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
            this.emit('error', new HciError_1.HciError(`Received connection update packet for unknown handle ${handleId}`));
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
                    .join(':');
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
            const targetHandleId = data.readUInt16LE(1 + i * 2);
            const targetNumPackets = data.readUInt16LE(1 + numHandles * 2 + i * 2);
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
        this.emit('error', new HciError_1.HciError(`Hardware error`, `${errorCode}`));
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
        if (ACL_START === flags) {
            const length = data.readUInt16LE(4);
            const cid = data.readUInt16LE(6);
            const pktData = data.slice(8);
            if (length === pktData.length) {
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
        else if (ACL_CONT === flags) {
            const buff = handle.buffer;
            if (!buff || !buff.data) {
                return;
            }
            buff.data = Buffer.concat([buff.data, data.slice(4)]);
            if (buff.data.length === buff.length) {
                this.emit('aclDataPkt', handleId, buff.cid, buff.data);
                handle.buffer = null;
            }
        }
    }
    handleCmdPkt(data) {
        const cmd = data.readUInt16LE(0);
        // const len = data.readUInt8(2);
        switch (cmd) {
            case LE_SET_SCAN_ENABLE_CMD:
                this.handleSetScanEnablePkt(data);
                break;
            case LE_SET_ADVERTISE_ENABLE_CMD:
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