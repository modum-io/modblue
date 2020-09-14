import { EventEmitter } from 'events';

import { Smp } from './smp';

export class AclStream extends EventEmitter {
	private hci: any;
	private handle: number;

	private smp: Smp;

	public constructor(
		hci: any,
		handle: number,
		localAddressType: any,
		localAddress: any,
		remoteAddressType: any,
		remoteAddress: any
	) {
		super();

		this.hci = hci;
		this.handle = handle;

		this.smp = new Smp(this, localAddressType, localAddress, remoteAddressType, remoteAddress);

		this.onSmpStk = this.onSmpStk.bind(this);
		this.onSmpFail = this.onSmpFail.bind(this);
		this.onSmpEnd = this.onSmpEnd.bind(this);

		this.smp.on('stk', this.onSmpStk);
		this.smp.on('fail', this.onSmpFail);
		this.smp.on('end', this.onSmpEnd);
	}

	public encrypt() {
		this.smp.sendPairingRequest();
	}

	public write(cid: any, data: Buffer) {
		this.hci.writeAclDataPkt(this.handle, cid, data);
	}

	public push(cid: any, data: Buffer) {
		if (data) {
			this.emit('data', cid, data);
		} else {
			this.emit('end');
		}
	}

	public pushEncrypt(encrypt: any) {
		this.emit('encrypt', encrypt);
	}

	private onSmpStk(stk: any) {
		const random = Buffer.from('0000000000000000', 'hex');
		const diversifier = Buffer.from('0000', 'hex');

		this.hci.startLeEncryption(this.handle, random, diversifier, stk);
	}

	private onSmpFail() {
		this.emit('encryptFail');
	}

	private onSmpEnd() {
		this.smp.removeListener('stk', this.onSmpStk);
		this.smp.removeListener('fail', this.onSmpFail);
		this.smp.removeListener('end', this.onSmpEnd);
	}
}
