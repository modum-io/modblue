'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.Adapter = void 0;
const Adapter_1 = require('../../Adapter');
const gap_1 = require('./gap');
const hci_1 = require('./hci');
const Peripheral_1 = require('./Peripheral');
class Adapter extends Adapter_1.BaseAdapter {
	constructor() {
		super(...arguments);
		this.initialized = false;
		this.scanning = false;
		this.peripherals = new Map();
		this.uuidToHandle = new Map();
		this.handleToUUID = new Map();
		this.onDiscover = (status, address, addressType, connectable, advertisement, rssi) => {
			address = address.toUpperCase();
			const uuid = address;
			let peripheral = this.peripherals.get(uuid);
			if (!peripheral) {
				peripheral = new Peripheral_1.Peripheral(
					this.noble,
					this,
					uuid,
					address,
					addressType,
					connectable,
					advertisement,
					rssi
				);
				this.peripherals.set(uuid, peripheral);
			} else {
				peripheral.connectable = connectable;
				peripheral.advertisement = advertisement;
				peripheral.rssi = rssi;
			}
			this.emit('discover', peripheral);
		};
	}
	async getScannedPeripherals() {
		return [...this.peripherals.values()];
	}
	async isScanning() {
		return this.scanning;
	}
	async init() {
		if (this.initialized) {
			return;
		}
		this.initialized = true;
		this.hci = new hci_1.Hci(Number(this.id));
		this.gap = new gap_1.Gap(this.hci);
		this.gap.on('discover', this.onDiscover);
		await this.hci.init();
		this._addressType = this.hci.addressType;
		this._address = this.hci.address;
	}
	dispose() {
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
	async startScanning() {
		await this.init();
		if (this.scanning) {
			return;
		}
		await this.gap.startScanning(true);
		this.scanning = true;
	}
	async stopScanning() {
		if (!this.scanning) {
			return;
		}
		await this.gap.stopScanning();
		this.scanning = false;
	}
	async connect(peripheral) {
		const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connecting timed out')), 10000));
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
	async disconnect(peripheral) {
		const handle = this.uuidToHandle.get(peripheral.uuid);
		const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Disconnecting timed out')), 10000));
		const disconnect = async () => {
			await this.hci.disconnect(handle);
			return true;
		};
		try {
			await Promise.race([disconnect(), timeout]);
		} catch (_a) {
			// NO-OP
		}
		await peripheral.onDisconnect();
	}
}
exports.Adapter = Adapter;
//# sourceMappingURL=Adapter.js.map
