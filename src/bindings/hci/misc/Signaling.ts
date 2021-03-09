import os from 'os';

import { Hci } from './Hci';

const CONNECTION_PARAMETER_UPDATE_REQUEST = 0x12;
const CONNECTION_PARAMETER_UPDATE_RESPONSE = 0x13;

const SIGNALING_CID = 0x0005;

export class Signaling {
	private hci: Hci;
	private handle: number;

	public constructor(hci: Hci, handle: number) {
		this.handle = handle;
		this.hci = hci;
		this.hci.on('aclDataPkt', this.onAclStreamData);
	}

	public dispose(): void {
		if (this.hci) {
			this.hci.off('aclDataPkt', this.onAclStreamData);
			this.hci = null;
		}

		this.handle = null;
	}

	private onAclStreamData = (handle: number, cid: number, data: Buffer) => {
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

	private processConnectionParameterUpdateRequest(identifier: number, data: Buffer) {
		const minInterval = data.readUInt16LE(0) * 1.25;
		const maxInterval = data.readUInt16LE(2) * 1.25;
		const latency = data.readUInt16LE(4);
		const supervisionTimeout = data.readUInt16LE(6) * 10;

		if (os.platform() !== 'linux') {
			const response = Buffer.alloc(6);

			response.writeUInt8(CONNECTION_PARAMETER_UPDATE_RESPONSE, 0); // code
			response.writeUInt8(identifier, 1); // identifier
			response.writeUInt16LE(2, 2); // length
			response.writeUInt16LE(0, 4);

			this.hci.writeAclDataPkt(this.handle, SIGNALING_CID, response);

			this.hci.connUpdateLe(this.handle, minInterval, maxInterval, latency, supervisionTimeout).catch(() => null);
		} else {
			this.hci.trackSentAclPackets(this.handle, 1);
		}
	}
}
