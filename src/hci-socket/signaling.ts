import { EventEmitter } from 'events';
import os from 'os';

import { AclStream } from './acl-stream';

const CONNECTION_PARAMETER_UPDATE_REQUEST = 0x12;
const CONNECTION_PARAMETER_UPDATE_RESPONSE = 0x13;

const SIGNALING_CID = 0x0005;

export declare interface Signaling {
	on(
		event: 'connectionParameterUpdateRequest',
		listener: (
			handle: number,
			minInterval: number,
			maxInterval: number,
			latency: number,
			supervisionTimeout: number
		) => void
	): this;
}

export class Signaling extends EventEmitter {
	private handle: number;
	private aclStream: AclStream;

	public constructor(handle: number, aclStream: AclStream) {
		super();

		this.handle = handle;
		this.aclStream = aclStream;

		this.aclStream.on('data', this.onAclStreamData);
		this.aclStream.on('end', this.onAclStreamEnd);
	}

	private onAclStreamData = (cid: number, data: Buffer) => {
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

	private onAclStreamEnd = () => {
		this.aclStream.off('data', this.onAclStreamData);
		this.aclStream.off('end', this.onAclStreamEnd);
	};

	private processConnectionParameterUpdateRequest(identifier: number, data: Buffer) {
		const minInterval = data.readUInt16LE(0) * 1.25;
		const maxInterval = data.readUInt16LE(2) * 1.25;
		const latency = data.readUInt16LE(4);
		const supervisionTimeout = data.readUInt16LE(6) * 10;

		if (os.platform() !== 'linux' || process.env.HCI_CHANNEL_USER) {
			const response = Buffer.alloc(6);

			response.writeUInt8(CONNECTION_PARAMETER_UPDATE_RESPONSE, 0); // code
			response.writeUInt8(identifier, 1); // identifier
			response.writeUInt16LE(2, 2); // length
			response.writeUInt16LE(0, 4);

			this.aclStream.write(SIGNALING_CID, response);

			this.emit('connectionParameterUpdateRequest', this.handle, minInterval, maxInterval, latency, supervisionTimeout);
		}
	}
}
