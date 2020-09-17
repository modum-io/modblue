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
    constructor(handle, aclStream) {
        super();
        this.onAclStreamData = (cid, data) => {
            if (cid !== SIGNALING_CID) {
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
        this.onAclStreamEnd = () => {
            this.aclStream.off('data', this.onAclStreamData);
            this.aclStream.off('end', this.onAclStreamEnd);
        };
        this.handle = handle;
        this.aclStream = aclStream;
        this.aclStream.on('data', this.onAclStreamData);
        this.aclStream.on('end', this.onAclStreamEnd);
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
            this.aclStream.write(SIGNALING_CID, response);
            this.emit('connectionParameterUpdateRequest', minInterval, maxInterval, latency, supervisionTimeout);
        }
    }
}
exports.Signaling = Signaling;
//# sourceMappingURL=signaling.js.map