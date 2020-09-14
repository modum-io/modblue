"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AclStream = void 0;
const events_1 = require("events");
const smp_1 = require("./smp");
class AclStream extends events_1.EventEmitter {
    constructor(hci, handle, localAddressType, localAddress, remoteAddressType, remoteAddress) {
        super();
        this.hci = hci;
        this.handle = handle;
        this.smp = new smp_1.Smp(this, localAddressType, localAddress, remoteAddressType, remoteAddress);
        this.onSmpStk = this.onSmpStk.bind(this);
        this.onSmpFail = this.onSmpFail.bind(this);
        this.onSmpEnd = this.onSmpEnd.bind(this);
        this.smp.on('stk', this.onSmpStk);
        this.smp.on('fail', this.onSmpFail);
        this.smp.on('end', this.onSmpEnd);
    }
    encrypt() {
        this.smp.sendPairingRequest();
    }
    write(cid, data) {
        this.hci.writeAclDataPkt(this.handle, cid, data);
    }
    push(cid, data) {
        if (data) {
            this.emit('data', cid, data);
        }
        else {
            this.emit('end');
        }
    }
    pushEncrypt(encrypt) {
        this.emit('encrypt', encrypt);
    }
    onSmpStk(stk) {
        const random = Buffer.from('0000000000000000', 'hex');
        const diversifier = Buffer.from('0000', 'hex');
        this.hci.startLeEncryption(this.handle, random, diversifier, stk);
    }
    onSmpFail() {
        this.emit('encryptFail');
    }
    onSmpEnd() {
        this.smp.removeListener('stk', this.onSmpStk);
        this.smp.removeListener('fail', this.onSmpFail);
        this.smp.removeListener('end', this.onSmpEnd);
    }
}
exports.AclStream = AclStream;
//# sourceMappingURL=acl-stream.js.map