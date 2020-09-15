import { EventEmitter } from 'events';

import { AddressType } from '../Bindings';

import { AclStream } from './acl-stream';
import * as crypto from './crypto';

const SMP_CID = 0x0006;

const SMP_PAIRING_REQUEST = 0x01;
const SMP_PAIRING_RESPONSE = 0x02;
const SMP_PAIRING_CONFIRM = 0x03;
const SMP_PAIRING_RANDOM = 0x04;
const SMP_PAIRING_FAILED = 0x05;
const SMP_ENCRYPT_INFO = 0x06;
const SMP_MASTER_IDENT = 0x07;

export declare interface Smp {
	on(event: 'end', listener: () => void): this;
	on(event: 'fail', listener: () => void): this;
	on(event: 'stk', listener: (stk: Buffer) => void): this;
	on(event: 'ltk', listener: (ltk: Buffer) => void): this;
	on(event: 'masterIdent', listener: (ediv: Buffer, rand: Buffer) => void): this;
}

export class Smp extends EventEmitter {
	private aclStream: AclStream;
	private iat: Buffer;
	private ia: Buffer;
	private rat: Buffer;
	private ra: Buffer;
	private tk: Buffer;
	private preq: Buffer;
	private pres: Buffer;
	private pcnf: Buffer;
	private r: Buffer;

	public constructor(
		aclStream: AclStream,
		localAddressType: AddressType,
		localAddress: string,
		remoteAddressType: AddressType,
		remoteAddress: string
	) {
		super();

		this.aclStream = aclStream;

		this.iat = Buffer.from([localAddressType === 'random' ? 0x01 : 0x00]);
		this.ia = Buffer.from(localAddress.split(':').reverse().join(''), 'hex');
		this.rat = Buffer.from([remoteAddressType === 'random' ? 0x01 : 0x00]);
		this.ra = Buffer.from(remoteAddress.split(':').reverse().join(''), 'hex');

		this.aclStream.on('data', this.onAclStreamData);
		this.aclStream.on('end', this.onAclStreamEnd);
	}

	public sendPairingRequest() {
		this.preq = Buffer.from([
			SMP_PAIRING_REQUEST,
			0x03, // IO capability: NoInputNoOutput
			0x00, // OOB data: Authentication data not present
			0x01, // Authentication requirement: Bonding - No MITM
			0x10, // Max encryption key size
			0x00, // Initiator key distribution: <none>
			0x01 // Responder key distribution: EncKey
		]);

		this.write(this.preq);
	}

	private onAclStreamData = (cid: number, data: Buffer) => {
		if (cid !== SMP_CID) {
			return;
		}

		const code = data.readUInt8(0);

		if (SMP_PAIRING_RESPONSE === code) {
			this.handlePairingResponse(data);
		} else if (SMP_PAIRING_CONFIRM === code) {
			this.handlePairingConfirm(data);
		} else if (SMP_PAIRING_RANDOM === code) {
			this.handlePairingRandom(data);
		} else if (SMP_PAIRING_FAILED === code) {
			this.handlePairingFailed(data);
		} else if (SMP_ENCRYPT_INFO === code) {
			this.handleEncryptInfo(data);
		} else if (SMP_MASTER_IDENT === code) {
			this.handleMasterIdent(data);
		}
	};

	private onAclStreamEnd = () => {
		this.aclStream.removeListener('data', this.onAclStreamData);
		this.aclStream.removeListener('end', this.onAclStreamEnd);

		this.emit('end');
	};

	private handlePairingResponse(data: Buffer) {
		this.pres = data;

		this.tk = Buffer.from('00000000000000000000000000000000', 'hex');
		this.r = crypto.r();

		this.write(
			Buffer.concat([
				Buffer.from([SMP_PAIRING_CONFIRM]),
				crypto.c1(this.tk, this.r, this.pres, this.preq, this.iat, this.ia, this.rat, this.ra)
			])
		);
	}

	private handlePairingConfirm(data: Buffer) {
		this.pcnf = data;

		this.write(Buffer.concat([Buffer.from([SMP_PAIRING_RANDOM]), this.r]));
	}

	private handlePairingRandom(data: Buffer) {
		const r = data.slice(1);

		const pcnf = Buffer.concat([
			Buffer.from([SMP_PAIRING_CONFIRM]),
			crypto.c1(this.tk, r, this.pres, this.preq, this.iat, this.ia, this.rat, this.ra)
		]);

		if (this.pcnf.toString('hex') === pcnf.toString('hex')) {
			const stk = crypto.s1(this.tk, r, this.r);

			this.emit('stk', stk);
		} else {
			this.write(Buffer.from([SMP_PAIRING_RANDOM, SMP_PAIRING_CONFIRM]));

			this.emit('fail');
		}
	}

	private handlePairingFailed(data: Buffer) {
		this.emit('fail');
	}

	private handleEncryptInfo(data: Buffer) {
		const ltk = data.slice(1);

		this.emit('ltk', ltk);
	}

	private handleMasterIdent(data: Buffer) {
		const ediv = data.slice(1, 3);
		const rand = data.slice(3);

		this.emit('masterIdent', ediv, rand);
	}

	private write(data: Buffer) {
		this.aclStream.write(SMP_CID, data);
	}
}
