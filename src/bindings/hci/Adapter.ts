import { BaseAdapter } from '../../Adapter';
import { BasePeripheral } from '../../Peripheral';
import { AddressType } from '../../types';

import { Gap } from './gap';
import { Hci } from './hci';
import { Noble } from './Noble';
import { Peripheral } from './Peripheral';

export class Adapter extends BaseAdapter<Noble> {
	private initialized: boolean = false;
	private scanning: boolean = false;

	private hci: Hci;
	private gap: Gap;

	private peripherals: Map<string, Peripheral> = new Map();
	private uuidToHandle: Map<string, number> = new Map();
	private handleToUUID: Map<number, string> = new Map();

	public async getScannedPeripherals(): Promise<BasePeripheral[]> {
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

		this.gap = new Gap(this.hci);
		this.gap.on('discover', this.onDiscover);

		await this.hci.init();

		this._addressType = this.hci.addressType;
		this._address = this.hci.address;
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

		await this.gap.startScanning(true);

		this.scanning = true;
	}

	public async stopScanning(): Promise<void> {
		if (!this.scanning) {
			return;
		}

		await this.gap.stopScanning();

		this.scanning = false;
	}

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
			peripheral = new Peripheral(this.noble, this, uuid, address, addressType, connectable, advertisement, rssi);
			this.peripherals.set(uuid, peripheral);
		} else {
			peripheral.connectable = connectable;
			peripheral.advertisement = advertisement;
			peripheral.rssi = rssi;
		}

		this.emit('discover', peripheral);
	};

	public async connect(peripheral: Peripheral) {
		const timeout = new Promise<void>((_, reject) =>
			setTimeout(() => reject(new Error('Connecting timed out')), 10000)
		);

		const connet = async () => {
			const { handle, role } = await this.hci.createLeConn(peripheral.address, peripheral.addressType);
			if (role !== 0) {
				throw new Error(`Connection was not established as master`);
			}

			this.uuidToHandle.set(peripheral.uuid, handle);
			this.handleToUUID.set(handle, peripheral.uuid);

			await peripheral.onConnect(this.hci, handle);

			return true;
		};

		try {
			await Promise.race([connet(), timeout]);
		} catch (err) {
			await peripheral.onDisconnect();
			throw err;
		}
	}

	public async disconnect(peripheral: Peripheral) {
		const handle = this.uuidToHandle.get(peripheral.uuid);

		const timeout = new Promise<void>((_, reject) =>
			setTimeout(() => reject(new Error('Disconnecting timed out')), 10000)
		);

		const disconnect = async () => {
			await this.hci.disconnect(handle);
			return true;
		};

		try {
			await Promise.race([disconnect(), timeout]);
		} catch {
			// NO-OP
		}

		await peripheral.onDisconnect();
	}
}
