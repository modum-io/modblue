import { Adapter, GattLocal, Peripheral } from '../../models';
import { AddressType } from '../../types';

import { HciGattLocal } from './gatt';
import { Gap, Hci } from './misc';
import { HciPeripheral } from './Peripheral';

export class HciAdapter extends Adapter {
	private initialized: boolean = false;
	private scanning: boolean = false;
	private advertising: boolean = false;
	private wasAdvertising: boolean = false;

	private hci: Hci;
	private gap: Gap;
	private gatt: HciGattLocal;

	private deviceName: string = this.id;
	private advertisedServiceUUIDs: string[] = [];
	private peripherals: Map<string, HciPeripheral> = new Map();
	private connectedDevices: Map<number, HciPeripheral> = new Map();
	private uuidToHandle: Map<string, number> = new Map();
	private handleToUUID: Map<number, string> = new Map();

	private async init() {
		if (this.initialized) {
			return;
		}

		this.initialized = true;

		this.hci = new Hci(Number(this.id));
		this.hci.on('leScanEnable', this.onLeScanEnable);
		this.hci.on('leAdvertiseEnable', this.onLeAdvertiseEnable);
		this.hci.on('leConnComplete', this.onLeConnComplete);
		this.hci.on('disconnectComplete', this.onDisconnectComplete);
		this.hci.on('error', this.onHciError);

		this.gap = new Gap(this.hci);
		this.gap.on('discover', this.onDiscover);

		await this.hci.init();

		this._addressType = this.hci.addressType;
		this._address = this.hci.address;
	}

	private onHciError = (code: number) => {
		this.emit('error', `HCI hardware error ${code}`);
		this.hci.reset().catch((err) => this.emit('error', `Could not reset HCI controller: ${err}`));
	};

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

		this.scanning = false;

		await this.gap.stopScanning();
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
		// For BLE <= 4.2:
		// - Disable advertising while we're connected.
		// - Don't connect if we have a connection in master mode
		if (this.hci.hciVersion < 8) {
			if ([...this.connectedDevices.values()].some((d) => d.isMaster)) {
				throw new Error(`Connecting in master & slave role concurrently is only supported in BLE 5+`);
			}

			if (this.advertising) {
				this.wasAdvertising = true;
				try {
					await this.stopAdvertising();
				} catch (err) {
					this.emit('error', `Could not disable advertising before connecting: ${err}`);
					this.wasAdvertising = false;
				}
			}
		}

		try {
			const handle = await this.hci.createLeConn(peripheral.address, peripheral.addressType);

			this.uuidToHandle.set(peripheral.uuid, handle);
			this.handleToUUID.set(handle, peripheral.uuid);

			peripheral.onConnect(false, this.hci, handle);
			this.connectedDevices.set(handle, peripheral);
		} catch (err) {
			// Dispose anything in case we got a partial setup/connection done
			peripheral.onDisconnect();

			// Re-enable advertising since we didn't establish a connection
			if (this.wasAdvertising) {
				await this.startAdvertising(this.deviceName, this.advertisedServiceUUIDs);
				this.wasAdvertising = false;
			}

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
			peripheral.onDisconnect();
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

	private onLeScanEnable = (enabled: boolean) => {
		// We have to restart scanning if we were scanning before
		if (this.scanning && !enabled) {
			this.emit('error', `LE scanning unexpectedly disabled`);
			this.scanning = false;
			this.startScanning().catch((err) => this.emit('error', `Could not re-enable LE scanning: ${err}`));
		}
	};

	private onLeAdvertiseEnable = (enabled: boolean) => {
		// We have to restart advertising if we were advertising before
		if (this.advertising && !enabled) {
			this.emit('error', `LE advertising unexpectedly disabled`);
			this.advertising = false;
			this.startAdvertising(this.deviceName, this.advertisedServiceUUIDs).catch((err) =>
				this.emit('error', `Could not re-enable LE advertising: ${err}`)
			);
		}
	};

	private onLeConnComplete = (
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
		peripheral.onConnect(true, this.hci, handle);

		this.connectedDevices.set(handle, peripheral);
		this.emit('connect', peripheral);

		// Advertising automatically stops, so change the state accordingly
		this.wasAdvertising = true;
		this.advertising = false;
	};

	private onDisconnectComplete = (status: number, handle: number, reason?: string) => {
		// Check if we have a connected device and remove it
		const connectedDevice = this.connectedDevices.get(handle);
		if (connectedDevice) {
			connectedDevice.onDisconnect();
			this.connectedDevices.delete(handle);

			// If the device was connected in master mode we inform our local listeners
			if (connectedDevice.isMaster) {
				this.emit('disconnect', connectedDevice, reason);
			}
		}

		// We have to restart advertising if we were advertising before, and if all devices disconnected
		if (this.wasAdvertising && this.connectedDevices.size === 0) {
			this.startAdvertising(this.deviceName, this.advertisedServiceUUIDs).catch((err) =>
				this.emit('error', `Could not re-enable advertising after disconnect: ${err}`)
			);
			this.wasAdvertising = false;
		}
	};
}
