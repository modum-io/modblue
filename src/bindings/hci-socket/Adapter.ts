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
}

interface DisconnectRequest {
	resolve?: () => void;
	reject?: (error: any) => void;
}

export class Adapter extends BaseAdapter<Noble> {
	private initialized: boolean = false;
	private scanning: boolean = false;

	private hci: Hci;
	private gap: Gap;

	private peripherals: Map<string, Peripheral> = new Map();
	private uuidToHandle: Map<string, number> = new Map();
	private handleToUUID: Map<number, string> = new Map();

	private connectionRequest: ConnectRequest;
	private connectionRequestQueue: ConnectRequest[] = [];
	private disconnectRequest: Map<string, DisconnectRequest> = new Map();

	public async getAllPeripherals(): Promise<Peripheral[]> {
		return [...this.peripherals.values()];
	}

	public async isPowered(): Promise<boolean> {
		this.init();
		return this.hci.isUp;
	}

	public async isScanning(): Promise<boolean> {
		return this.scanning;
	}

	private init() {
		if (this.initialized) {
			return;
		}

		this.hci = new Hci();
		this.hci.on('addressChange', (addr) => console.log(`Address change: ${addr}`));
		this.hci.on('leConnComplete', this.onLeConnComplete);

		this.gap = new Gap(this.hci);
		this.gap.on('scanStart', this.onScanStart);
		this.gap.on('scanStop', this.onScanStop);

		this.hci.init(Number(this.id));

		this.initialized = true;
	}

	public async startScanning(): Promise<void> {
		this.init();

		this.gap.on('discover', this.onDiscover);

		this.gap.startScanning(true);
	}

	public async stopScanning(): Promise<void> {
		this.gap.off('discover', this.onDiscover);

		this.gap.stopScanning();
	}

	private onScanStart = () => {
		this.scanning = true;
	};

	private onScanStop = () => {
		this.scanning = false;
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
		const request: ConnectRequest = { peripheral, requestedMTU };

		if (!this.connectionRequest) {
			this.connectionRequest = request;
			this.hci.createLeConn(request.peripheral.address, request.peripheral.addressType);
		} else {
			this.connectionRequestQueue.push(request);
		}

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

			const gatt = new Gatt(address, aclStream);

			const signaling = new Signaling(handle, aclStream);
			signaling.on('connectionParameterUpdateRequest', this.onConnectionParameterUpdateRequest);

			const mtu = request.requestedMTU || 256;
			gatt.exchangeMtu(mtu);

			peripheral.onConnect(aclStream, gatt, signaling);

			request.resolve();
		} else {
			const statusMessage = (Hci.STATUS_MAPPER[status] || 'HCI Error: Unknown') + ` (0x${status.toString(16)})`;
			request.reject(new Error(statusMessage));
		}

		this.connectionRequest = null;
		if (this.connectionRequestQueue.length > 0) {
			const newRequest = this.connectionRequestQueue.shift();
			this.connectionRequest = newRequest;
			this.hci.createLeConn(newRequest.peripheral.address, newRequest.peripheral.addressType);
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
