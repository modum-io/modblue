import { Adapter, Peripheral } from '../../models';
import { AddressType } from '../../types';

import { HciGattLocal } from './gatt';
import { Gap, Hci } from './misc';
import { HciPeripheral } from './Peripheral';

interface ConnectRequest {
	peripheral: HciPeripheral;
	resolve?: () => void;
	reject?: (error: any) => void;
	isDone?: boolean;
}

export class HciAdapter extends Adapter {
	private initialized: boolean = false;
	private scanning: boolean = false;
	private advertising: boolean = false;
	private requestScanStop: boolean = false;

	private hci: Hci;
	private gap: Gap;
	private gatt: HciGattLocal;

	private peripherals: Map<string, HciPeripheral> = new Map();
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

		this.gap = new Gap(this.hci);
		this.gap.on('scanStart', this.onScanStart);
		this.gap.on('scanStop', this.onScanStop);
		this.gap.on('discover', this.onDiscover);
		this.gap.on('advertisingStart', this.onAdvertisingStart);
		this.gap.on('advertisingStop', this.onAdvertisingStop);

		this.gatt = new HciGattLocal(this);

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

		if (this.scanning) {
			return;
		}

		return new Promise<void>((resolve) => {
			const done = () => {
				this.gap.off('scanStart', done);

				resolve();
			};

			this.gap.on('scanStart', done);

			this.gap.startScanning(true);
		});
	}

	private onScanStart = () => {
		this.scanning = true;
	};

	public async stopScanning(): Promise<void> {
		if (!this.scanning) {
			return;
		}

		return new Promise<void>((resolve) => {
			const done = () => {
				this.gap.off('scanStop', done);

				resolve();
			};

			this.gap.on('scanStop', done);

			this.requestScanStop = true;
			this.gap.stopScanning();
		});
	}

	private onScanStop = () => {
		this.scanning = false;

		if (this.requestScanStop) {
			this.requestScanStop = false;
			return;
		}

		// Some adapters stop scanning when connecting. We want to automatically start scanning again.
		this.startScanning().catch(() => {
			// NO-OP
		});
	};

	private onDiscover = (
		status: number,
		address: string,
		addressType: AddressType,
		connectable: boolean,
		advertisement: any,
		rssi: number
	) => {
		address = address.toUpperCase();
		const uuid = address;

		let peripheral = this.peripherals.get(uuid);
		if (!peripheral) {
			peripheral = new HciPeripheral(this, uuid, address, addressType, advertisement, rssi);
			this.peripherals.set(uuid, peripheral);
		} else {
			peripheral.advertisement = advertisement;
			peripheral.rssi = rssi;
		}

		this.emit('discover', peripheral);
	};

	public async connect(peripheral: HciPeripheral) {
		const request: ConnectRequest = { peripheral, isDone: false };

		const disconnect = (disconnHandle: number, reason: number) => {
			// If the device was connected then the handle should be there
			const handle = this.uuidToHandle.get(peripheral.uuid);

			if (!handle || disconnHandle !== handle) {
				// This isn't our peripheral, ignore
				return;
			}

			this.hci.off('disconnComplete', disconnect);

			// Always perform the disconnect steps
			peripheral.onDisconnect();

			this.uuidToHandle.delete(peripheral.uuid);
			this.handleToUUID.delete(handle);

			// This disconnect handler is also called after we established a connection,
			// on sudden connection drop. Only reject the connection request if we're not done yet.
			if (!request.isDone) {
				request.reject(new Error(`Disconnect while connecting: Code ${reason}`));
				this.connectionRequest = null;
				this.processConnectionRequests();
			}
		};

		// Add a disconnect handler in case our peripheral gets disconnect while connecting
		this.hci.on('disconnComplete', disconnect);

		const timeout = () => {
			// Don't cancel the connection if we've already established it
			if (request.isDone) {
				return;
			}

			this.hci.cancelLeConn();

			// Don't actively reject the promise, as it will be reject in the le conn create callback
		};
		setTimeout(timeout, 10000);

		this.connectionRequestQueue.push(request);
		this.processConnectionRequests();

		// Create a promise to resolve once the connection request is done
		// (we may have to wait in queue for other connections to complete first)
		// tslint:disable-next-line: promise-must-complete
		return new Promise<void>((res, rej) => {
			request.resolve = () => {
				request.isDone = true;
				res();
			};
			request.reject = (error?: any) => {
				request.isDone = true;
				rej(error);
			};
		});
	}

	private onLeConnComplete = async (
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
		if (role === 0) {
			// Master - we scanned & initiated the connection
			const uuid = address.toUpperCase();

			const peripheral = this.peripherals.get(uuid);
			if (!peripheral) {
				console.log(`Unknown peripheral ${address} connected`);
				return;
			}

			const request = this.connectionRequest;
			if (!request) {
				console.log(`Peripheral ${address} connected, but we have no pending connection request`);
				return;
			}
			if (request.peripheral !== peripheral) {
				console.log(`Peripheral ${address} connected, but we requested ${request.peripheral.address}`);
				return;
			}

			if (status === 0) {
				this.uuidToHandle.set(uuid, handle);
				this.handleToUUID.set(handle, uuid);

				await peripheral.onConnect(this.hci, handle);

				if (!request.isDone) {
					request.resolve();
				}
			} else {
				const statusMessage = (Hci.STATUS_MAPPER[status] || 'HCI Error: Unknown') + ` (0x${status.toString(16)})`;
				if (!request.isDone) {
					request.reject(new Error(statusMessage));
				}
			}

			this.connectionRequest = null;
			this.processConnectionRequests();
		} else if (role === 1) {
			// Slave - we're accepting an incoming connection
			console.log(`Incoming connection from ${address}`);
		}
	};

	private processConnectionRequests() {
		if (this.connectionRequest) {
			return;
		}

		if (this.connectionRequestQueue.length > 0) {
			const newRequest = this.connectionRequestQueue.shift();
			this.connectionRequest = newRequest;
			this.hci.createLeConn(newRequest.peripheral.address, newRequest.peripheral.addressType);
		}
	}

	public async disconnect(peripheral: HciPeripheral) {
		const handle = this.uuidToHandle.get(peripheral.uuid);

		return new Promise<number>((resolve) => {
			const done = (disconnHandle: number, reason: number) => {
				if (disconnHandle !== handle) {
					// This isn't our peripheral, ignore
					return;
				}

				// Any other disconnect handling is done in the handler that we attached during connect

				this.hci.off('disconnComplete', done);

				resolve(reason);
			};

			this.hci.on('disconnComplete', done);

			this.hci.disconnect(handle);
		});
	}

	public async startAdvertising(deviceName: string, serviceUUIDs?: string[]): Promise<void> {
		await this.init();

		if (this.advertising) {
			return;
		}

		this.gatt.setData(deviceName, []);

		return new Promise<void>((resolve) => {
			const done = () => {
				this.gap.off('advertisingStart', done);

				resolve();
			};

			this.gap.on('advertisingStart', done);

			this.gap.startAdvertising(this.gatt.deviceName, serviceUUIDs || []);
		});
	}
	private onAdvertisingStart = () => {
		this.advertising = true;
	};

	public async stopAdvertising(): Promise<void> {
		if (!this.advertising) {
			return;
		}

		return new Promise<void>((resolve) => {
			const done = () => {
				this.gap.off('advertisingStop', done);

				resolve();
			};

			this.gap.on('advertisingStop', done);

			this.gap.stopAdvertising();
		});
	}
	private onAdvertisingStop = () => {
		this.advertising = false;
	};
}
