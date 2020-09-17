"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Signaling = void 0;
const events_1 = require("events");
const os_1 = __importDefault(require("os"));
const CONNECTION_PARAMETER_UPDATE_REQUEST = 0x12;
const CONNECTION_PARAMETER_UPDATE_RESPONSE = 0x13;
const SIGNALING_CID = 0x0005;
class Signaling extends events_1.EventEmitter {
    constructor(hci, handle) {
        super();
        this.onAclStreamData = (handle, cid, data) => {
            if (handle !== this.handle || cid !== SIGNALING_CID) {
                return;
            }
            const code = data.readUInt8(0);
            const identifier = data.readUInt8(1);
            // const length = data.readUInt16LE(2);
            const signalingData = data.slice(4);
            if (code === CONNECTION_PARAMETER_UPDATE_REQUEST) {
                this.processConnectionParameterUpdateRequest(identifier, signalingData);
            }
        };
        this.handle = handle;
        this.hci = hci;
        this.hci.on('aclDataPkt', this.onAclStreamData);
    }
    dispose() {
        this.hci.off('aclDataPkt', this.onAclStreamData);
    }
    processConnectionParameterUpdateRequest(identifier, data) {
        const minInterval = data.readUInt16LE(0) * 1.25;
        const maxInterval = data.readUInt16LE(2) * 1.25;
        const latency = data.readUInt16LE(4);
        const supervisionTimeout = data.readUInt16LE(6) * 10;
        if (os_1.default.platform() !== 'linux' || process.env.HCI_CHANNEL_USER) {
            const response = Buffer.alloc(6);
            response.writeUInt8(CONNECTION_PARAMETER_UPDATE_RESPONSE, 0); // code
            response.writeUInt8(identifier, 1); // identifier
            response.writeUInt16LE(2, 2); // length
            response.writeUInt16LE(0, 4);
            this.hci.writeAclDataPkt(this.handle, SIGNALING_CID, response);
            this.emit('connectionParameterUpdateRequest', minInterval, maxInterval, latency, supervisionTimeout);
        }
    }
}
exports.Signaling = Signaling;
//# sourceMappingURL=signaling.js.map