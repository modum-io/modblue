import { BaseAdapter } from '../../Adapter';
import { AddressType } from '../../types';

import { AclStream } from './acl-stream';
import { Gap } from './gap';
import { Gatt } from './gatt';
import { Hci } from './hci';
import { Noble } from './Noble';
import { Peripheral } from './Peripheral';
import { Signaling } from './signaling';

interface ConnectRequest {
	peripheral: Peripheral;
	requestedMTU?: number;
	resolve?: () => void;
	reject?: (error: any) => void;
	isDone?: boolean;
}

export class Adapter extends BaseAdapter<Noble> {
	private initialized: boolean = false;
	private scanning: boolean = false;
	private requestScanStop: boolean = false;
	private requestScanRestart: boolean = false;

	private hci: Hci;
	private gap: Gap;

	private peripherals: Map<string, Peripheral> = new Map();
	private uuidToHandle: Map<string, number> = new Map();
	private handleToUUID: Map<number, string> = new Map();

	private connectionRequest: ConnectRequest;
	private connectionRequestQueue: ConnectRequest[] = [];

	public async getScannedPeripherals(): Promise<Peripheral[]> {
		return [...this.peripherals.values()];
	}

	public async isScanning(): Promise<boolean> {
		return this.scanning;
	}

	private async init() {
		if (this.initialized) {
			return;
		}

		this.initialized = true;

		this.hci = new Hci(Number(this.id));
		this.hci.on('addressChange', (addr) => (this._address = addr));
		this.hci.on('leConnComplete', this.onLeConnComplete);
		this.hci.on('encryptChange', this.onEncryptChange);
		this.hci.on('aclDataPkt', this.onAclDataPkt);

		this.gap = new Gap(this.hci);
		this.gap.on('scanStart', this.onScanStart);
		this.gap.on('scanStop', this.onScanStop);

		await this.hci.init();
	}

	public dispose() {
		if (!this.initialized) {
			return;
		}

		this.initialized = false;

		this.hci.removeAllListeners();
		this.hci.dispose();
		this.hci = null;

		this.gap.removeAllListeners();
		this.gap = null;
	}

	public async startScanning(): Promise<void> {
		await this.init();

		this.gap.on('discover', this.onDiscover);

		this.gap.startScanning(true);
	}

	private onScanStart = () => {
		this.scanning = true;
	};

	public async stopScanning(): Promise<void> {
		this.gap.off('discover', this.onDiscover);

		this.requestScanStop = true;
		this.gap.stopScanning();
	}

	private onScanStop = () => {
		this.scanning = false;

		if (this.requestScanStop) {
			this.requestScanStop = false;
			return;
		}

		// Some devices stop scanning when connecting.
		// We want to automatically start scanning again as soon as we're connected
		this.requestScanRestart = true;
	};

	private onDiscover = (
		status: number,
		address: string,
		addressType: AddressType,
		connectable: boolean,
		advertisement: any,
		rssi: number
	) => {
		const uuid = address.toUpperCase();

		let peripheral = this.peripherals.get(uuid);
		if (!peripheral) {
			peripheral = new Peripheral(this.noble, this, uuid, address, addressType, connectable, advertisement, rssi);
			this.peripherals.set(uuid, peripheral);
		} else {
			peripheral.connectable = connectable;
			peripheral.advertisement = advertisement;
			peripheral.rssi = rssi;
		}

		this.emit('discover', peripheral);
	};

	public async connect(peripheral: Peripheral, requestedMTU?: number) {
		const request: ConnectRequest = { peripheral, requestedMTU, isDone: false };

		if (!this.connectionRequest) {
			this.connectionRequest = request;
			this.hci.createLeConn(request.peripheral.address, request.peripheral.addressType);
		} else {
			this.connectionRequestQueue.push(request);
		}

		const disconnect = (disconnHandle: number, reason: number) => {
			// If the device connected then the handle should be there
			const handle = this.uuidToHandle.get(peripheral.uuid);

			if (!handle || disconnHandle !== handle) {
				// This isn't our peripheral, ignore
				return;
			}

			peripheral.onDisconnect();

			this.uuidToHandle.delete(peripheral.uuid);
			this.handleToUUID.delete(handle);

			this.hci.off('disconnComplete', disconnect);

			if (!request.isDone) {
				request.isDone = true;
				request.reject(new Error(`Disconnect while connecting: Code ${reason}`));
			}
		};

		// Add a disconnect handler in case our peripheral gets disconnect while connecting
		this.hci.on('disconnComplete', disconnect);

		// Create a promise to resolve once the connection request is done
		// (we may have to wait in queue for other connections to complete first)
		// tslint:disable-next-line: promise-must-complete
		return new Promise<void>((res, rej) => {
			request.resolve = res;
			request.reject = rej;
		});
	}

	private onLeConnComplete = (
		status: number,
		handle: number,
		role: number,
		addressType: AddressType,
		address: string,
		interval: number,
		latency: number,
		supervisionTimeout: number,
		masterClockAccuracy: number
	) => {
		if (role !== 0) {
			// not master, ignore
			console.log(`Ignoring connection to ${address} because we're not master`);
			return;
		}

		const uuid = address.toUpperCase();

		const peripheral = this.peripherals.get(uuid);
		if (!peripheral) {
			console.log(`Unknown peripheral ${address} connected`);
			return;
		}

		const request = this.connectionRequest;
		if (request.peripheral !== peripheral) {
			console.log(`Peripheral ${address} connected, but we requested ${request.peripheral.address}`);
			return;
		}

		if (status === 0) {
			this.uuidToHandle.set(uuid, handle);
			this.handleToUUID.set(handle, uuid);

			const aclStream = new AclStream(this.hci, handle, this.hci.addressType, this.hci.address, addressType, address);

			const gatt = new Gatt(aclStream);

			const signaling = new Signaling(handle, aclStream);
			signaling.on('connectionParameterUpdateRequest', this.onConnectionParameterUpdateRequest);

			peripheral.onConnect(aclStream, gatt, signaling);

			const mtu = request.requestedMTU || 256;
			gatt.exchangeMtu(mtu);

			if (!request.isDone) {
				request.isDone = true;
				request.resolve();
			}
		} else {
			const statusMessage = (Hci.STATUS_MAPPER[status] || 'HCI Error: Unknown') + ` (0x${status.toString(16)})`;
			if (!request.isDone) {
				request.isDone = true;
				request.reject(new Error(statusMessage));
			}
		}

		this.connectionRequest = null;
		if (this.connectionRequestQueue.length > 0) {
			const newRequest = this.connectionRequestQueue.shift();
			this.connectionRequest = newRequest;
			this.hci.createLeConn(newRequest.peripheral.address, newRequest.peripheral.addressType);
		} else {
			// If we stopped scanning because of the connection event and there are
			// no more pending connections, then restart scanning
			if (this.requestScanRestart) {
				this.requestScanRestart = false;
				this.startScanning().catch(() => {
					// NO-OP
				});
			}
		}
	};

	private onConnectionParameterUpdateRequest = (
		handle: number,
		minInterval: number,
		maxInterval: number,
		latency: number,
		supervisionTimeout: number
	) => {
		this.hci.connUpdateLe(handle, minInterval, maxInterval, latency, supervisionTimeout);
	};

	private onEncryptChange = (handle: number, encrypt: number) => {
		const uuid = this.handleToUUID.get(handle);
		const peripheral = this.peripherals.get(uuid);
		if (!peripheral) {
			return;
		}

		peripheral.getACLStream().pushEncrypt(encrypt);
	};

	private onAclDataPkt = (handle: number, cid: number, data: Buffer) => {
		const uuid = this.handleToUUID.get(handle);
		const peripheral = this.peripherals.get(uuid);
		if (!peripheral) {
			return;
		}

		peripheral.getACLStream().push(cid, data);
	};

	public async disconnect(peripheral: Peripheral) {
		const handle = this.uuidToHandle.get(peripheral.uuid);

		return new Promise<number>((resolve) => {
			const done = (disconnHandle: number, reason: number) => {
				if (disconnHandle !== handle) {
					// This isn't our peripheral, ignore
					return;
				}

				peripheral.onDisconnect();

				this.uuidToHandle.delete(peripheral.uuid);
				this.handleToUUID.delete(handle);

				this.hci.off('disconnComplete', done);

				resolve(reason);
			};

			this.hci.on('disconnComplete', done);

			this.hci.disconnect(handle);
		});
	}
}
