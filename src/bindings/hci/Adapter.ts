import { Adapter, GattLocal, Peripheral } from '../../models';
import { AddressType } from '../../types';

import { HciGattLocal } from './gatt';
import { Gap, Hci } from './misc';
import { HciPeripheral } from './Peripheral';

export class HciAdapter extends Adapter {
	private initialized: boolean = false;
	private scanning: boolean = false;
	private advertising: boolean = false;

	private hci: Hci;
	private gap: Gap;
	private gatt: HciGattLocal;

	private deviceName: string = this.id;
	private advertisedServiceUUIDs: string[] = [];
	private peripherals: Map<string, HciPeripheral> = new Map();
	private connectedDevices: Map<number, Peripheral> = new Map();
	private uuidToHandle: Map<string, number> = new Map();
	private handleToUUID: Map<number, string> = new Map();

	private async init() {
		if (this.initialized) {
			return;
		}

		this.initialized = true;

		this.hci = new Hci(Number(this.id));
		this.hci.on('leScanEnable', this.onLeScanEnable);
		this.hci.on('leConnComplete', this.onLeConnComplete);
		this.hci.on('disconnectComplete', this.onDisconnectComplete);

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

	public async isScanning(): Promise<boolean> {
		return this.scanning;
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

	public async getScannedPeripherals(): Promise<Peripheral[]> {
		return [...this.peripherals.values()];
	}

	private onDiscover = (
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
			peripheral = new HciPeripheral(this, uuid, addressType, address, advertisement, rssi);
			this.peripherals.set(uuid, peripheral);
		} else {
			peripheral.advertisement = advertisement;
			peripheral.rssi = rssi;
		}

		this.emit('discover', peripheral);
	};

	public async connect(peripheral: HciPeripheral) {
		// Advertising & connecting simultaneously is only supported with Bluetooth 4.2+
		if (this.hci.hciVersion < 8 && this.advertising) {
			throw new Error(`Advertising and connecting simultaneously is supported with Bluetooth 4.2+`);
		}

		try {
			const handle = await this.hci.createLeConn(peripheral.address, peripheral.addressType);

			this.uuidToHandle.set(peripheral.uuid, handle);
			this.handleToUUID.set(handle, peripheral.uuid);

			await peripheral.onConnect(this.hci, handle);
		} catch (err) {
			// Dispose anything in case we got a partial setup/connection done
			await peripheral.onDisconnect();

			// Rethrow
			throw err;
		}
	}

	public async disconnect(peripheral: HciPeripheral) {
		const handle = this.uuidToHandle.get(peripheral.uuid);

		try {
			await this.hci.disconnect(handle);
		} catch {
			// NO-OP
		} finally {
			await peripheral.onDisconnect();
		}
	}

	public async isAdvertising(): Promise<boolean> {
		return this.advertising;
	}

	public async startAdvertising(deviceName: string, serviceUUIDs?: string[]): Promise<void> {
		await this.init();

		if (this.advertising) {
			return;
		}

		this.deviceName = deviceName;
		this.advertisedServiceUUIDs = serviceUUIDs;
		if (this.gatt) {
			this.gatt.setData(this.deviceName, this.gatt.serviceInputs);
		}

		await this.gap.startAdvertising(this.deviceName, serviceUUIDs || []);

		this.advertising = true;
	}

	public async stopAdvertising(): Promise<void> {
		if (!this.advertising) {
			return;
		}

		await this.gap.stopAdvertising();

		this.advertising = false;
	}

	public async setupGatt(maxMtu?: number): Promise<GattLocal> {
		await this.init();

		this.gatt = new HciGattLocal(this, this.hci, maxMtu);
		this.gatt.setData(this.deviceName, []);
		return this.gatt;
	}

	private onLeScanEnable = async (enabled: boolean, filterDuplicates: boolean) => {
		// We have to restart scanning if we were scanning before
		if (this.scanning && !enabled) {
			this.scanning = false;
			await this.startScanning();
		}
	};

	private onLeConnComplete = async (
		status: number,
		handle: number,
		role: number,
		addressType: AddressType,
		address: string
	) => {
		// Skip failed or master connections, they are handled elsewhere
		if (status !== 0 || role === 0) {
			return;
		}

		address = address.toUpperCase();
		const uuid = address;

		const peripheral = new HciPeripheral(this, uuid, addressType, address, null, 0);
		this.connectedDevices.set(handle, peripheral);

		this.emit('connect', peripheral);
	};

	private onDisconnectComplete = async (status: number, handle: number, reason?: string) => {
		if (status !== 0) {
			return;
		}

		const connectedDevice = this.connectedDevices.get(handle);
		if (connectedDevice) {
			this.connectedDevices.delete(handle);
			this.emit('disconnect', connectedDevice, reason);
		}

		// We have to restart advertising if we were advertising before
		if (this.advertising) {
			this.advertising = false;
			await this.startAdvertising(this.deviceName, this.advertisedServiceUUIDs);
		}
	};
}
