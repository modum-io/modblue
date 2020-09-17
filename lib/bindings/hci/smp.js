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
exports.Smp = void 0;
const events_1 = require("events");
const crypto = __importStar(require("./crypto"));
const SMP_CID = 0x0006;
const SMP_PAIRING_REQUEST = 0x01;
const SMP_PAIRING_RESPONSE = 0x02;
const SMP_PAIRING_CONFIRM = 0x03;
const SMP_PAIRING_RANDOM = 0x04;
const SMP_PAIRING_FAILED = 0x05;
const SMP_ENCRYPT_INFO = 0x06;
const SMP_MASTER_IDENT = 0x07;
class Smp extends events_1.EventEmitter {
    constructor(aclStream, localAddressType, localAddress, remoteAddressType, remoteAddress) {
        super();
        this.onAclStreamData = (cid, data) => {
            if (cid !== SMP_CID) {
                return;
            }
            const code = data.readUInt8(0);
            if (SMP_PAIRING_RESPONSE === code) {
                this.handlePairingResponse(data);
            }
            else if (SMP_PAIRING_CONFIRM === code) {
                this.handlePairingConfirm(data);
            }
            else if (SMP_PAIRING_RANDOM === code) {
                this.handlePairingRandom(data);
            }
            else if (SMP_PAIRING_FAILED === code) {
                this.handlePairingFailed(data);
            }
            else if (SMP_ENCRYPT_INFO === code) {
                this.handleEncryptInfo(data);
            }
            else if (SMP_MASTER_IDENT === code) {
                this.handleMasterIdent(data);
            }
        };
        this.onAclStreamEnd = () => {
            this.aclStream.off('data', this.onAclStreamData);
            this.aclStream.off('end', this.onAclStreamEnd);
            this.emit('end');
        };
        this.aclStream = aclStream;
        this.iat = Buffer.from([localAddressType === 'random' ? 0x01 : 0x00]);
        this.ia = Buffer.from(localAddress.split(':').reverse().join(''), 'hex');
        this.rat = Buffer.from([remoteAddressType === 'random' ? 0x01 : 0x00]);
        this.ra = Buffer.from(remoteAddress.split(':').reverse().join(''), 'hex');
        this.aclStream.on('data', this.onAclStreamData);
        this.aclStream.on('end', this.onAclStreamEnd);
    }
    sendPairingRequest() {
        this.preq = Buffer.from([
            SMP_PAIRING_REQUEST,
            0x03,
            0x00,
            0x01,
            0x10,
            0x00,
            0x01 // Responder key distribution: EncKey
        ]);
        this.write(this.preq);
    }
    handlePairingResponse(data) {
        this.pres = data;
        this.tk = Buffer.from('00000000000000000000000000000000', 'hex');
        this.r = crypto.r();
        this.write(Buffer.concat([
            Buffer.from([SMP_PAIRING_CONFIRM]),
            crypto.c1(this.tk, this.r, this.pres, this.preq, this.iat, this.ia, this.rat, this.ra)
        ]));
    }
    handlePairingConfirm(data) {
        this.pcnf = data;
        this.write(Buffer.concat([Buffer.from([SMP_PAIRING_RANDOM]), this.r]));
    }
    handlePairingRandom(data) {
        const r = data.slice(1);
        const pcnf = Buffer.concat([
            Buffer.from([SMP_PAIRING_CONFIRM]),
            crypto.c1(this.tk, r, this.pres, this.preq, this.iat, this.ia, this.rat, this.ra)
        ]);
        if (this.pcnf.toString('hex') === pcnf.toString('hex')) {
            const stk = crypto.s1(this.tk, r, this.r);
            this.emit('stk', stk);
        }
        else {
            this.write(Buffer.from([SMP_PAIRING_RANDOM, SMP_PAIRING_CONFIRM]));
            this.emit('fail');
        }
    }
    handlePairingFailed(data) {
        this.emit('fail');
    }
    handleEncryptInfo(data) {
        const ltk = data.slice(1);
        this.emit('ltk', ltk);
    }
    handleMasterIdent(data) {
        const ediv = data.slice(1, 3);
        const rand = data.slice(3);
        this.emit('masterIdent', ediv, rand);
    }
    write(data) {
        this.aclStream.write(SMP_CID, data);
    }
}
exports.Smp = Smp;
//# sourceMappingURL=smp.js.map