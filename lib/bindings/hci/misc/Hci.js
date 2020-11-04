"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hci = void 0;
const events_1 = require("events");
const hci_status_json_1 = __importDefault(require("./hci-status.json"));
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
const EVT_CMD_COMPLETE = 0x0e;
const EVT_CMD_STATUS = 0x0f;
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
class Hci extends events_1.EventEmitter {
    constructor(deviceId) {
        super();
        this.onSocketData = async (data) => {
            const eventType = data.readUInt8(0);
            let handle;
            let cmd;
            let status;
            let queuedCmd;
            switch (eventType) {
                case HCI_EVENT_PKT:
                    const subEventType = data.readUInt8(1);
                    this.emit(`event_${subEventType}`, data);
                    switch (subEventType) {
                        case EVT_CMD_COMPLETE:
                            cmd = data.readUInt16LE(4);
                            status = data.readUInt8(6);
                            const result = data.slice(7);
                            queuedCmd = this.cmds.get(cmd);
                            if (queuedCmd) {
                                queuedCmd.onResponse(status, result);
                                this.cmds.delete(cmd);
                            }
                            break;
                        case EVT_CMD_STATUS:
                            status = data.readUInt8(3);
                            cmd = data.readUInt16LE(5);
                            queuedCmd = this.cmds.get(cmd);
                            if (queuedCmd) {
                                queuedCmd.onStatus(status);
                            }
                            break;
                        case EVT_LE_META_EVENT:
                            const leMetaEventType = data.readUInt8(3);
                            const leMetaEventStatus = data.readUInt8(4);
                            const leMetaEventData = data.slice(5);
                            this.emit(`event_le_${leMetaEventType}`, leMetaEventStatus, leMetaEventData);
                            if (leMetaEventType === EVT_LE_ADVERTISING_REPORT) {
                                this.processLeAdvertisingReport(leMetaEventStatus, leMetaEventData);
                            }
                            break;
                        default:
                            break;
                    }
                    break;
                case HCI_ACLDATA_PKT:
                    const flags = data.readUInt16LE(1) >> 12;
                    handle = data.readUInt16LE(1) & 0x0fff;
                    if (ACL_START === flags) {
                        const cid = data.readUInt16LE(7);
                        const length = data.readUInt16LE(5);
                        const pktData = data.slice(9);
                        if (length === pktData.length) {
                            this.emit('aclDataPkt', handle, cid, pktData);
                        }
                        else {
                            this.handleBuffers.set(handle, {
                                length: length,
                                cid: cid,
                                data: pktData
                            });
                        }
                    }
                    else if (ACL_CONT === flags) {
                        const buff = this.handleBuffers.get(handle);
                        if (!buff || !buff.data) {
                            return;
                        }
                        buff.data = Buffer.concat([buff.data, data.slice(5)]);
                        if (buff.data.length === buff.length) {
                            this.emit('aclDataPkt', handle, buff.cid, buff.data);
                            this.handleBuffers.delete(handle);
                        }
                    }
                    break;
                case HCI_COMMAND_PKT:
                    /*cmd = data.readUInt16LE(1);
                    const len = data.readUInt8(3);*/
                    break;
                default:
                    break;
            }
        };
        this.onSocketError = (error) => {
            if (error.code === 'EPERM') {
                this.state = 'unauthorized';
            }
            else if (error.message === 'Network is down') {
                // no-op
            }
        };
        this.state = null;
        this.deviceId = deviceId;
        this.handleBuffers = new Map();
        this.cmds = new Map();
    }
    static getDeviceList() {
        const socket = new BluetoothHciSocket();
        return socket.getDeviceList();
    }
    async init() {
        this.socket = new BluetoothHciSocket();
        this.socket.on('data', this.onSocketData);
        this.socket.on('error', this.onSocketError);
        this.deviceId = this.socket.bindRaw(this.deviceId);
        this.socket.start();
        await new Promise((resolve) => {
            const timer = setInterval(() => {
                if (this.socket.isDevUp()) {
                    clearInterval(timer);
                    resolve();
                }
                // tslint:disable-next-line: align
            }, 1000);
        });
        this.setSocketFilter();
        await this.setEventMask();
        await this.setLeEventMask();
        if (this.state === 'unauthorized') {
            throw new Error('Not authorized');
        }
        const { hciVer, hciRev } = await this.readLocalVersion();
        if (hciVer < 0x06) {
            throw new Error(`HCI version ${hciVer}.${hciRev} not supported`);
        }
        try {
            await this.setScanEnabled(false, true);
        }
        catch (_a) {
            // NO-OP
        }
        await this.writeLeHostSupported();
        await this.readLeHostSupported();
        await this.readBdAddr();
        await this.readLeBufferSize();
        this.state = 'poweredOn';
    }
    dispose() {
        this.socket.stop();
        this.socket.removeAllListeners();
        this.socket = null;
    }
    async sendCommand(data, onlyStatus) {
        const cmd = data.readUInt16LE(1);
        if (this.cmds.has(cmd)) {
            throw new Error(`${cmd} command already queued`);
        }
        return new Promise((resolve, reject) => {
            this.cmds.set(cmd, {
                data,
                onStatus: (status) => {
                    if (onlyStatus) {
                        status !== 0
                            ? reject(new Error(`Command ${cmd} status ${hci_status_json_1.default[status]} (0x${status.toString(16)})`))
                            : resolve();
                        this.cmds.delete(cmd);
                    }
                },
                onResponse: (status, responseData) => status !== 0
                    ? reject(new Error(`Command ${cmd} response ${hci_status_json_1.default[status]} (0x${status.toString(16)})`))
                    : resolve(responseData)
            });
            this.socket.write(data);
        });
    }
    async waitForEvent(event) {
        return new Promise((resolve) => {
            const handler = (data) => {
                this.removeListener(`event_${event}`, handler);
                resolve(data);
            };
            this.addListener(`event_${event}`, handler);
        });
    }
    async waitForLeMetaEvent(metaEvent) {
        return new Promise((resolve, reject) => {
            const handler = (status, data) => {
                this.removeListener(`event_le_${metaEvent}`, handler);
                if (status !== 0) {
                    reject(new Error(`Received LE error ${hci_status_json_1.default[status]} (0x${status.toString(16)})`));
                }
                else {
                    resolve(data);
                }
            };
            this.addListener(`event_le_${metaEvent}`, handler);
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
        cmd.writeUInt16LE(OCF_RESET | (OGF_HOST_CTL << 10), 1);
        // length
        cmd.writeUInt8(0x00, 3);
        await this.sendCommand(cmd);
        this.dispose();
        await this.init();
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
    async createLeConn(address, addressType) {
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
        cmd.writeUInt16LE(0x0006, 17); // min interval
        cmd.writeUInt16LE(0x000c, 19); // max interval
        cmd.writeUInt16LE(0x0000, 21); // latency
        cmd.writeUInt16LE(0x00c8, 23); // supervision timeout
        cmd.writeUInt16LE(0x0004, 25); // min ce length
        cmd.writeUInt16LE(0x0006, 27); // max ce length
        try {
            // Cancel any other connection requests before trying this one
            await this.cancelLeConn();
        }
        catch (_a) {
            // NO-OP
        }
        await this.sendCommand(cmd, true);
        while (true) {
            const data = await this.waitForLeMetaEvent(EVT_LE_CONN_COMPLETE);
            const handle = data.readUInt16LE(0);
            const role = data.readUInt8(2);
            const _addressType = data.readUInt8(3) === 0x01 ? 'random' : 'public';
            const _address = data
                .slice(4, 10)
                .toString('hex')
                .match(/.{1,2}/g)
                .reverse()
                .join(':')
                .toUpperCase();
            const interval = data.readUInt16LE(10) * 1.25;
            const latency = data.readUInt16LE(12); // TODO: multiplier?
            const supervisionTimeout = data.readUInt16LE(14) * 10;
            const masterClockAccuracy = data.readUInt8(16); // TODO: multiplier?
            if (addressType === _addressType && address === _address) {
                return { handle, role, interval, latency, supervisionTimeout, masterClockAccuracy };
            }
        }
    }
    async cancelLeConn() {
        const cmd = Buffer.alloc(4);
        // header
        cmd.writeUInt8(HCI_COMMAND_PKT, 0);
        cmd.writeUInt16LE(LE_CANCEL_CONN_CMD, 1);
        // length
        cmd.writeUInt8(0x00, 3);
        await this.sendCommand(cmd);
    }
    connUpdateLe(handle, minInterval, maxInterval, latency, supervisionTimeout) {
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
        this.socket.write(cmd);
    }
    startLeEncryption(handle, random, diversifier, key) {
        const cmd = Buffer.alloc(32);
        // header
        cmd.writeUInt8(HCI_COMMAND_PKT, 0);
        cmd.writeUInt16LE(LE_START_ENCRYPTION_CMD, 1);
        // length
        cmd.writeUInt8(0x1c, 3);
        // data
        cmd.writeUInt16LE(handle, 4); // handle
        random.copy(cmd, 6);
        diversifier.copy(cmd, 14);
        key.copy(cmd, 16);
        this.socket.write(cmd);
    }
    async disconnect(handle, reason) {
        const cmd = Buffer.alloc(7);
        reason = reason || HCI_OE_USER_ENDED_CONNECTION;
        // header
        cmd.writeUInt8(HCI_COMMAND_PKT, 0);
        cmd.writeUInt16LE(DISCONNECT_CMD, 1);
        // length
        cmd.writeUInt8(0x03, 3);
        // data
        cmd.writeUInt16LE(handle, 4); // handle
        cmd.writeUInt8(reason, 6); // reason
        await this.sendCommand(cmd, true);
        while (true) {
            const data = await this.waitForEvent(EVT_DISCONN_COMPLETE);
            const disconnHandle = data.readUInt16LE(4);
            if (disconnHandle === handle) {
                break;
            }
        }
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
    writeAclDataPkt(handle, cid, data) {
        const pkt = Buffer.alloc(9 + data.length);
        // header
        pkt.writeUInt8(HCI_ACLDATA_PKT, 0);
        pkt.writeUInt16LE(handle | (ACL_START_NO_FLUSH << 12), 1);
        pkt.writeUInt16LE(data.length + 4, 3); // data length 1
        pkt.writeUInt16LE(data.length, 5); // data length 2
        pkt.writeUInt16LE(cid, 7);
        data.copy(pkt, 9);
        this.socket.write(pkt);
    }
    async readLeBufferSize() {
        const cmd = Buffer.alloc(4);
        // header
        cmd.writeUInt8(HCI_COMMAND_PKT, 0);
        cmd.writeUInt16LE(LE_READ_BUFFER_SIZE_CMD, 1);
        // length
        cmd.writeUInt8(0x0, 3);
        await this.sendCommand(cmd);
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
    processLeAdvertisingReport(count, data) {
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
                this.emit('leAdvertisingReport', 0, type, address, addressType, eir, rssi);
                data = data.slice(eirLength + 10);
            }
        }
        catch (e) {
            console.warn(`processLeAdvertisingReport: Caught illegal packet: ${e}`);
        }
    }
}
exports.Hci = Hci;
Hci.STATUS_MAPPER = hci_status_json_1.default;
//# sourceMappingURL=Hci.js.map