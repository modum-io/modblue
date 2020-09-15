import { EventEmitter } from 'events';

import { Hci } from './hci';
import { Smp } from './smp';

export declare interface AclStream {
	on(event: 'data', listener: (cid: number, data: Buffer) => void): this;
	on(event: 'end', listener: () => void): this;
	on(event: 'encrypt', listener: (encrypt: number) => void): this;
	on(event: 'encryptFail', listener: () => void): this;
}

export class AclStream extends EventEmitter {
	private hci: Hci;
	private handle: number;

	private smp: Smp;

	public constructor(
		hci: Hci,
		handle: number,
		localAddressType: string,
		localAddress: string,
		remoteAddressType: string,
		remoteAddress: string
	) {
		super();

		this.hci = hci;
		this.handle = handle;

		this.smp = new Smp(this, localAddressType, localAddress, remoteAddressType, remoteAddress);

		this.smp.on('stk', this.onSmpStk);
		this.smp.on('fail', this.onSmpFail);
		this.smp.on('end', this.onSmpEnd);
	}

	public encrypt() {
		this.smp.sendPairingRequest();
	}

	public write(cid: number, data: Buffer) {
		this.hci.writeAclDataPkt(this.handle, cid, data);
	}

	public push(cid: number, data: Buffer) {
		if (data) {
			this.emit('data', cid, data);
		} else {
			this.emit('end');
		}
	}

	public pushEncrypt(encrypt: number) {
		this.emit('encrypt', encrypt);
	}

	private onSmpStk = (stk: Buffer) => {
		const random = Buffer.from('0000000000000000', 'hex');
		const diversifier = Buffer.from('0000', 'hex');

		this.hci.startLeEncryption(this.handle, random, diversifier, stk);
	};

	private onSmpFail = () => {
		this.emit('encryptFail');
	};

	private onSmpEnd = () => {
		this.smp.off('stk', this.onSmpStk);
		this.smp.off('fail', this.onSmpFail);
		this.smp.off('end', this.onSmpEnd);
	};
}
