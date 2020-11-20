import { Mutex } from 'async-mutex';
import { EventEmitter } from 'events';

import { AddressType } from '../../../types';

import STATUS_MAPPER from './hci-status.json';

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
const OCF_READ_BUFER_SIZE = 0x0005;
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
const READ_BUFFER_SIZE_CMD = OCF_READ_BUFER_SIZE | (OGF_INFO_PARAM << 10);
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

interface HciDevice {
	devId: number;
	devUp: boolean;
	idVendor: null;
	idProduct: null;
	busNumber: null;
	name: string;
	address: string;
}

interface Handle {
	id: number;
	buffer: HandleBuffer;
	aclPacketsInQueue: number;
}

interface HandleBuffer {
	length: number;
	cid: number;
	data: Buffer;
}

interface HciCommand {
	cmd: number;
	data: Buffer;
	onStatus: (status: number) => void;
	onResponse: (status: number, data: Buffer) => void;
}

type StateChangeListener = (newState: string) => void;
type AclDataPacketListener = (handle: number, cid: number, data: Buffer) => void;

type LeScanEnableListener = (enabled: boolean, filterDuplicates: boolean) => void;
type LeConnCompleteListener = (
	status: number,
	handle: number,
	role: number,
	addressType: AddressType,
	address: string,
	interval: number,
	latency: number,
	supervisionTimeout: number,
	masterClockAccuracy: number
) => void;
type DisconnectCompleteListener = (status: number, handle: number, reason: number) => void;

type LeAdvertisingReportListener = (
	type: number,
	address: string,
	addressType: AddressType,
	eir: Buffer,
	rssi: number
) => void;
type LeAdvertiseEnableListener = (enabled: boolean) => void;

export declare interface Hci {
	on(event: 'stateChange', listener: StateChangeListener): this;
	on(event: 'aclDataPkt', listener: AclDataPacketListener): this;

	on(event: 'leScanEnable', listener: LeScanEnableListener): this;
	on(event: 'leConnComplete', listener: LeConnCompleteListener): this;
	on(event: 'disconnectComplete', listener: DisconnectCompleteListener): this;

	on(event: 'leAdvertiseEnable', listener: LeAdvertiseEnableListener): this;
	on(event: 'leAdvertisingReport', listener: LeAdvertisingReportListener): this;
}

export class Hci extends EventEmitter {
	public state: string;
	public deviceId: number;

	public addressType: AddressType;
	public address: string;

	public hciVersion: number;
	public hciRevision: number;

	private socket: any;
	private socketTimer: NodeJS.Timer;
	private isSocketUp: boolean;
	private handles: Map<number, Handle>;

	private cmdMutex: Mutex;
	private pendingCmd: HciCommand;

	private aclDataPacketLength: number;
	private totalNumAclDataPackets: number;
	private aclLeDataPacketLength: number;
	private totalNumAclLeDataPackets: number;
	private aclPacketQueue: { handle: Handle; pkt: Buffer }[] = [];

	public constructor(deviceId?: number) {
		super();

		this.state = 'poweredOff';
		this.deviceId = deviceId;

		this.handles = new Map();

		this.cmdMutex = new Mutex();
		this.pendingCmd = null;
	}

	public static getDeviceList() {
		const socket = new BluetoothHciSocket();
		return socket.getDeviceList() as HciDevice[];
	}

	public async init() {
		this.socket = new BluetoothHciSocket();
		this.socket.on('data', this.onSocketData);
		this.socket.on('error', this.onSocketError);

		this.deviceId = this.socket.bindRaw(this.deviceId);
		this.socket.start();

		await this.checkSocketState();
		this.socketTimer = setInterval(this.checkSocketState, 1000);

		for (let i = 0; i < 5; i++) {
			if (this.isSocketUp) {
				break;
			}

			await new Promise((resolve) => setTimeout(resolve, 1000));
		}

		if (!this.isSocketUp) {
			throw new Error(`Initializing socket timed out - Are you sure it's running?`);
		}
	}

	private checkSocketState = async () => {
		const isUp = this.socket.isDevUp();

		if (isUp !== this.isSocketUp) {
			// If the hci socket state changed the initialize or cleanup our connection
			this.isSocketUp = isUp;

			if (isUp) {
				// Socket is now up
				this.setSocketFilter();

				await this.reset();

				if (this.state === 'unauthorized') {
					throw new Error('Not authorized');
				}

				await this.setEventMask();
				await this.setLeEventMask();

				const { hciVer, hciRev } = await this.readLocalVersion();
				this.hciVersion = hciVer;
				this.hciRevision = hciRev;

				if (hciVer < 0x06) {
					throw new Error(`HCI version ${hciVer}.${hciRev} not supported`);
				}

				await this.writeLeHostSupported();
				await this.readLeHostSupported();
				await this.readBufferSize();
				await this.readLeBufferSize();
				await this.readBdAddr();

				this.state = 'poweredOn';
				this.emit('stateChange', this.state);
			} else {
				// Socket went down

				// Cancel any pending commands
				if (this.pendingCmd) {
					this.pendingCmd.onStatus(0x03);
					this.pendingCmd.onResponse(0x03, null);
					this.pendingCmd = null;
				}

				this.state = 'poweredOff';
				this.emit('stateChange', this.state);
			}
		}
	};

	public dispose() {
		if (this.socketTimer) {
			clearInterval(this.socketTimer);
			this.socketTimer = null;
		}

		this.socket.stop();
		this.socket.removeAllListeners();
		this.socket = null;
	}

	private async sendCommand(data: Buffer, onlyStatus?: false): Promise<Buffer>;
	private async sendCommand(data: Buffer, onlyStatus?: true): Promise<void>;
	private async sendCommand(data: Buffer, onlyStatus?: boolean): Promise<Buffer | void> {
		const release = await this.cmdMutex.acquire();

		if (!this.isSocketUp) {
			release();
			throw new Error('HCI socket not available');
		}

		return new Promise<Buffer>((resolve, reject) => {
			const onDone = (status: number, responseData?: Buffer) => {
				this.pendingCmd = null;
				release();

				if (status !== 0) {
					reject(new Error(`HCI Command failed: ${STATUS_MAPPER[status]} (0x${status.toString(16).padStart(2, '0')})`));
				} else {
					resolve(responseData);
				}
			};

			this.pendingCmd = {
				cmd: data.readUInt16LE(1),
				data,
				onStatus: (status) => onlyStatus && onDone(status),
				onResponse: (status, responseData) => onDone(status, responseData)
			};

			this.socket.write(data);
		});
	}

	private async waitForEvent(event: number) {
		return new Promise<Buffer>((resolve) => {
			const handler = (data: Buffer) => {
				this.removeListener(`event_${event}`, handler);
				resolve(data);
			};
			this.addListener(`event_${event}`, handler);
		});
	}

	private async waitForLeMetaEvent(metaEvent: number) {
		return new Promise<Buffer>((resolve, reject) => {
			const handler = (status: number, data: Buffer) => {
				this.removeListener(`event_le_${metaEvent}`, handler);
				if (status !== 0) {
					reject(new Error(`Received LE error ${STATUS_MAPPER[status]} (0x${status.toString(16).padStart(2, '0')})`));
				} else {
					resolve(data);
				}
			};
			this.addListener(`event_le_${metaEvent}`, handler);
		});
	}

	private setSocketFilter() {
		const filter = Buffer.alloc(14);
		const typeMask = (1 << HCI_COMMAND_PKT) | (1 << HCI_EVENT_PKT) | (1 << HCI_ACLDATA_PKT);
		const eventMask1 =
			(1 << EVT_DISCONN_COMPLETE) |
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

	private async setEventMask() {
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

	private async reset() {
		const cmd = Buffer.alloc(4);

		// header
		cmd.writeUInt8(HCI_COMMAND_PKT, 0);
		cmd.writeUInt16LE(OCF_RESET | (OGF_HOST_CTL << 10), 1);

		// length
		cmd.writeUInt8(0x00, 3);

		await this.sendCommand(cmd);
	}

	private async readLocalVersion() {
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

	private async readBdAddr() {
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

	private async setLeEventMask() {
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

	private async readLeHostSupported() {
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

	private async writeLeHostSupported() {
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

	public async setScanParameters() {
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

	public async setScanEnabled(enabled: boolean, filterDuplicates: boolean) {
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

	public async createLeConn(address: string, addressType: AddressType) {
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
		} catch {
			// NO-OP
		}

		await this.sendCommand(cmd, true);

		return new Promise<number>((resolve, reject) => {
			const onComplete: LeConnCompleteListener = (status, handle, role, _addressType, _address) => {
				if (_address !== address || _addressType !== addressType) {
					return;
				}

				this.off('leConnComplete', onComplete);

				if (status !== 0) {
					reject(new Error(`LE conn failed: ${STATUS_MAPPER[status]} (0x${status.toString(16).padStart(2, '0')})`));
					return;
				}

				if (role !== 0) {
					reject(new Error(`Could not aquire le connection as master role`));
					return;
				}

				resolve(handle);
			};

			this.on('leConnComplete', onComplete);
		});
	}

	public async cancelLeConn() {
		const cmd = Buffer.alloc(4);

		// header
		cmd.writeUInt8(HCI_COMMAND_PKT, 0);
		cmd.writeUInt16LE(LE_CANCEL_CONN_CMD, 1);

		// length
		cmd.writeUInt8(0x00, 3);

		await this.sendCommand(cmd);
	}

	public connUpdateLe(
		handle: number,
		minInterval: number,
		maxInterval: number,
		latency: number,
		supervisionTimeout: number
	) {
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

	public startLeEncryption(handle: number, random: any, diversifier: Buffer, key: Buffer) {
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

	public async disconnect(handle: number, reason?: number) {
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

	public async readRssi(handle: number) {
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

	public writeAclDataPkt(handleId: number, cid: number, data: Buffer) {
		if (!this.isSocketUp) {
			throw new Error('HCI socket not available');
		}

		let handle = this.handles.get(handleId);
		if (!handle) {
			handle = { id: handleId, aclPacketsInQueue: 0, buffer: null };
			this.handles.set(handleId, handle);
		}

		let hf = handleId | (ACL_START_NO_FLUSH << 12);

		// l2cap PDU may be fragmented on hci level
		let l2capPdu = Buffer.alloc(4 + data.length);
		l2capPdu.writeUInt16LE(data.length, 0);
		l2capPdu.writeUInt16LE(cid, 2);
		data.copy(l2capPdu, 4);

		while (l2capPdu.length) {
			const frag = l2capPdu.slice(0, this.aclLeDataPacketLength);
			l2capPdu = l2capPdu.slice(frag.length);
			const pkt = Buffer.alloc(5 + frag.length);

			// hci header
			pkt.writeUInt8(HCI_ACLDATA_PKT, 0);
			pkt.writeUInt16LE(hf, 1);
			hf |= ACL_CONT << 12;
			pkt.writeUInt16LE(frag.length, 3); // hci pdu length

			frag.copy(pkt, 5);

			this.aclPacketQueue.push({ handle, pkt: pkt });
		}

		this.processAclPacketQueue();
	}

	private processAclPacketQueue() {
		let inProgress = 0;
		for (const handle of this.handles.values()) {
			inProgress += handle.aclPacketsInQueue;
		}

		while (inProgress < this.totalNumAclLeDataPackets && this.aclPacketQueue.length > 0) {
			const { handle, pkt } = this.aclPacketQueue.shift();
			handle.aclPacketsInQueue++;
			inProgress++;
			this.socket.write(pkt);
		}

		if (this.aclPacketQueue.length > 0) {
			console.log('Pending acl packets', this.aclPacketQueue.length);
		}
	}

	public async readBufferSize() {
		const cmd = Buffer.alloc(4);

		// header
		cmd.writeUInt8(HCI_COMMAND_PKT, 0);
		cmd.writeUInt16LE(READ_BUFFER_SIZE_CMD, 1);

		// length
		cmd.writeUInt8(0x0, 3);

		const response = await this.sendCommand(cmd);

		this.aclDataPacketLength = response.readUInt16LE(0);
		// const syncDataPacketLength = response.readInt8(2);
		this.totalNumAclDataPackets = response.readUInt16LE(3);
		// const totalNumSyncDataPackets = response.readUInt16LE(5);
	}

	public async readLeBufferSize() {
		const cmd = Buffer.alloc(4);

		// header
		cmd.writeUInt8(HCI_COMMAND_PKT, 0);
		cmd.writeUInt16LE(LE_READ_BUFFER_SIZE_CMD, 1);

		// length
		cmd.writeUInt8(0x0, 3);

		const response = await this.sendCommand(cmd);

		this.aclLeDataPacketLength = response.readUInt16LE(0);
		if (this.aclLeDataPacketLength === 0) {
			this.aclLeDataPacketLength = this.aclDataPacketLength;
		}

		this.totalNumAclLeDataPackets = response.readUInt8(2);
		if (this.totalNumAclLeDataPackets === 0) {
			this.totalNumAclLeDataPackets = this.totalNumAclDataPackets;
		}
	}

	public async setScanResponseData(data: Buffer) {
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

	public async setAdvertisingData(data: Buffer) {
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

	public async setAdvertisingEnabled(enabled: boolean) {
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

	private onSocketData = async (data: Buffer) => {
		const eventType = data.readUInt8(0);

		switch (eventType) {
			case HCI_EVENT_PKT:
				const subEventType = data.readUInt8(1);

				this.emit(`event_${subEventType}`, data);

				switch (subEventType) {
					case EVT_DISCONN_COMPLETE:
						const disconnStatus = data.readUInt8(3);
						const disconnHandleId = data.readUInt16LE(4);
						const reason = data.readUInt8(6);

						/* As per Bluetooth Core specs:
							When the Host receives a Disconnection Complete, Disconnection Physical
							Link Complete or Disconnection Logical Link Complete event, the Host shall
							assume that all unacknowledged HCI Data Packets that have been sent to the
							Controller for the returned Handle have been flushed, and that the
							corresponding data buffers have been freed. */
						this.handles.delete(disconnHandleId);
						// Remove all pending packets for this handle from the queue
						this.aclPacketQueue = this.aclPacketQueue.filter(({ handle }) => handle.id !== disconnHandleId);

						this.emit('disconnectComplete', disconnStatus, disconnHandleId, reason);

						// Process acl packet queue because we may have more space now
						this.processAclPacketQueue();
						break;

					case EVT_CMD_COMPLETE:
						// const numHciCommands = data.readUInt8(3);
						const completeCmd = data.readUInt16LE(4);
						const completeStatus = data.readUInt8(6);
						const result = data.slice(7);

						if (completeCmd === 0x00 && completeStatus === 0x00) {
							// This event is generated when the controller was busy and is now ready to receive commands again
							break;
						}

						if (this.pendingCmd) {
							if (completeCmd === this.pendingCmd.cmd) {
								this.pendingCmd.onResponse(completeStatus, result);
							}
						}
						break;

					case EVT_CMD_STATUS:
						const statusStatus = data.readUInt8(3);
						// const numHciCommands = data.readUInt8(4);
						const statusCmd = data.readUInt16LE(5);

						if (statusStatus === 0x00 && statusCmd === 0x00) {
							// This event is generated when the controller was busy and is now ready to receive commands again
							break;
						}

						if (this.pendingCmd) {
							// Only report if the status concerns the command we issued
							if (statusCmd === this.pendingCmd.cmd) {
								this.pendingCmd.onStatus(statusStatus);
							}
						}
						break;

					case EVT_LE_META_EVENT:
						const leMetaEventType = data.readUInt8(3);
						const leMetaEventStatus = data.readUInt8(4);
						const leMetaEventData = data.slice(5);

						this.emit(`event_le_${leMetaEventType}`, leMetaEventStatus, leMetaEventData);

						if (leMetaEventType === EVT_LE_ADVERTISING_REPORT) {
							this.processLeAdvertisingReport(leMetaEventStatus, leMetaEventData);
						} else if (leMetaEventType === EVT_LE_CONN_COMPLETE) {
							this.processLeConnComplete(leMetaEventStatus, leMetaEventData);
						}
						break;

					case EVT_NUMBER_OF_COMPLETED_PACKETS:
						const numHandles = data.readUInt8(3);

						for (let i = 0; i < numHandles; i++) {
							const targetHandleId = data.readUInt16LE(4 + i * 2);
							const targetNumPackets = data.readUInt16LE(4 + numHandles * 2 + i * 2);

							const targetHandle = this.handles.get(targetHandleId);
							if (!targetHandle) {
								continue;
							}

							// We may receive completed events for packets that were sent before our application was started
							// so clamp the value to [0-inf)
							targetHandle.aclPacketsInQueue = Math.max(0, targetHandle.aclPacketsInQueue - targetNumPackets);

							// Process the packet queue because we may have more space now
							this.processAclPacketQueue();
						}
						break;

					default:
						break;
				}
				break;

			case HCI_ACLDATA_PKT:
				const flags = data.readUInt16LE(1) >> 12;
				const aclHandleId = data.readUInt16LE(1) & 0x0fff;

				let aclHandle = this.handles.get(aclHandleId);
				if (!aclHandle) {
					aclHandle = { id: aclHandleId, aclPacketsInQueue: 0, buffer: null };
					this.handles.set(aclHandleId, aclHandle);
				}

				if (ACL_START === flags) {
					const cid = data.readUInt16LE(7);

					const length = data.readUInt16LE(5);
					const pktData = data.slice(9);

					if (length === pktData.length) {
						this.emit('aclDataPkt', aclHandleId, cid, pktData);
					} else {
						aclHandle.buffer = {
							length: length,
							cid: cid,
							data: pktData
						};
					}
				} else if (ACL_CONT === flags) {
					const buff = aclHandle.buffer;

					if (!buff || !buff.data) {
						return;
					}

					buff.data = Buffer.concat([buff.data, data.slice(5)]);

					if (buff.data.length === buff.length) {
						this.emit('aclDataPkt', aclHandleId, buff.cid, buff.data);
						aclHandle.buffer = null;
					}
				}
				break;

			case HCI_COMMAND_PKT:
				const cmd = data.readUInt16LE(1);
				// const len = data.readUInt8(3);

				switch (cmd) {
					case LE_SET_SCAN_ENABLE_CMD:
						const scanEnabled = data.readUInt8(4) === 0x1;
						const filterDuplicates = data.readUInt8(5) === 0x1;

						this.emit('leScanEnable', scanEnabled, filterDuplicates);
						break;

					case LE_SET_ADVERTISE_ENABLE_CMD:
						const advertiseEnabled = data.readUInt8(4) === 0x1;

						this.emit('leAdvertiseEnable', advertiseEnabled);
						break;

					default:
						break;
				}
				break;

			default:
				break;
		}
	};

	private onSocketError = (error: any) => {
		if (error.code === 'EPERM') {
			this.state = 'unauthorized';
			this.emit('stateChange', this.state);
		} else if (error.message === 'Network is down') {
			// no-op
		}
	};

	private processLeConnComplete(status: number, data: Buffer) {
		const handleId = data.readUInt16LE(0);
		const role = data.readUInt8(2);
		const addressType = data.readUInt8(3) === 0x01 ? 'random' : 'public';
		const address = data
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

		if (!this.handles.has(handleId)) {
			this.handles.set(handleId, { id: handleId, aclPacketsInQueue: 0, buffer: null });
		}

		this.emit(
			'leConnComplete',
			status,
			handleId,
			role,
			addressType,
			address,
			interval,
			latency,
			supervisionTimeout,
			masterClockAccuracy
		);
	}

	private processLeAdvertisingReport(count: number, data: Buffer) {
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

				this.emit('leAdvertisingReport', type, address, addressType, eir, rssi);

				data = data.slice(eirLength + 10);
			}
		} catch (e) {
			console.warn(`processLeAdvertisingReport: Caught illegal packet: ${e}`);
		}
	}
}
