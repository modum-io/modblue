"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HciAdapter = void 0;
const models_1 = require("../../models");
const gatt_1 = require("./gatt");
const misc_1 = require("./misc");
const Peripheral_1 = require("./Peripheral");
class HciAdapter extends models_1.Adapter {
    constructor() {
        super(...arguments);
        this.initialized = false;
        this.scanning = false;
        this.advertising = false;
        this.wasAdvertising = false;
        this.deviceName = this.id;
        this.advertisedServiceUUIDs = [];
        this.peripherals = new Map();
        this.connectedDevices = new Map();
        this.uuidToHandle = new Map();
        this.handleToUUID = new Map();
        this.onHciError = (code) => {
            this.emit('error', `HCI hardware error ${code}`);
            this.hci.reset().catch((err) => this.emit('error', `Could not reset HCI controller: ${err}`));
        };
        this.onDiscover = (address, addressType, connectable, advertisement, rssi) => {
            address = address.toUpperCase();
            const uuid = address;
            let peripheral = this.peripherals.get(uuid);
            if (!peripheral) {
                peripheral = new Peripheral_1.HciPeripheral(this, uuid, addressType, address, advertisement, rssi);
                this.peripherals.set(uuid, peripheral);
            }
            else {
                peripheral.advertisement = advertisement;
                peripheral.rssi = rssi;
            }
            this.emit('discover', peripheral);
        };
        this.onLeScanEnable = (enabled) => {
            // We have to restart scanning if we were scanning before
            if (this.scanning && !enabled) {
                this.emit('error', `LE scanning unexpectedly disabled`);
                this.scanning = false;
                this.startScanning().catch((err) => this.emit('error', `Could not re-enable LE scanning: ${err}`));
            }
        };
        this.onLeAdvertiseEnable = (enabled) => {
            // We have to restart advertising if we were advertising before
            if (this.advertising && !enabled) {
                this.emit('error', `LE advertising unexpectedly disabled`);
                this.advertising = false;
                this.startAdvertising(this.deviceName, this.advertisedServiceUUIDs).catch((err) => this.emit('error', `Could not re-enable LE advertising: ${err}`));
            }
        };
        this.onLeConnComplete = (status, handle, role, addressType, address) => {
            // Skip failed or master connections, they are handled elsewhere
            if (status !== 0 || role === 0) {
                return;
            }
            address = address.toUpperCase();
            const uuid = address;
            const peripheral = new Peripheral_1.HciPeripheral(this, uuid, addressType, address, null, 0);
            peripheral.onConnect(this.hci, handle);
            this.connectedDevices.set(handle, peripheral);
            this.emit('connect', peripheral);
            // Advertising automatically stops, so change the state accordingly
            this.wasAdvertising = true;
            this.advertising = false;
        };
        this.onDisconnectComplete = (status, handle, reason) => {
            // Check if we have a connected device and remove it
            const connectedDevice = this.connectedDevices.get(handle);
            if (connectedDevice) {
                connectedDevice.onDisconnect();
                this.connectedDevices.delete(handle);
                this.emit('disconnect', connectedDevice, reason);
            }
            // We have to restart advertising if we were advertising before, and if all devices disconnected
            if (this.wasAdvertising && this.connectedDevices.size === 0) {
                this.startAdvertising(this.deviceName, this.advertisedServiceUUIDs).catch((err) => this.emit('error', `Could not re-enable advertising after disconnect: ${err}`));
                this.wasAdvertising = false;
            }
        };
    }
    async init() {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        this.hci = new misc_1.Hci(Number(this.id));
        this.hci.on('leScanEnable', this.onLeScanEnable);
        this.hci.on('leAdvertiseEnable', this.onLeAdvertiseEnable);
        this.hci.on('leConnComplete', this.onLeConnComplete);
        this.hci.on('disconnectComplete', this.onDisconnectComplete);
        this.hci.on('error', this.onHciError);
        this.gap = new misc_1.Gap(this.hci);
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
    async isScanning() {
        return this.scanning;
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
        this.scanning = false;
        await this.gap.stopScanning();
    }
    async getScannedPeripherals() {
        return [...this.peripherals.values()];
    }
    async connect(peripheral) {
        if (this.hci.hciVersion < 8 && this.connectedDevices.size > 0) {
            throw new Error(`Connecting in master & slave role concurrently is only supported in BLE 5+`);
        }
        // For BLE <= 4.2 disable advertising while we're connected
        if (this.hci.hciVersion < 8 && this.advertising) {
            this.wasAdvertising = true;
            try {
                await this.stopAdvertising();
            }
            catch (err) {
                this.emit('error', `Could not disable advertising before connecting: ${err}`);
                this.wasAdvertising = false;
            }
        }
        try {
            const handle = await this.hci.createLeConn(peripheral.address, peripheral.addressType);
            this.uuidToHandle.set(peripheral.uuid, handle);
            this.handleToUUID.set(handle, peripheral.uuid);
            peripheral.onConnect(this.hci, handle);
            this.connectedDevices.set(handle, peripheral);
        }
        catch (err) {
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
    async disconnect(peripheral) {
        const handle = this.uuidToHandle.get(peripheral.uuid);
        try {
            await this.hci.disconnect(handle);
        }
        catch (_a) {
            // NO-OP
        }
        finally {
            peripheral.onDisconnect();
        }
    }
    async isAdvertising() {
        return this.advertising;
    }
    async startAdvertising(deviceName, serviceUUIDs) {
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
    async stopAdvertising() {
        if (!this.advertising) {
            return;
        }
        await this.gap.stopAdvertising();
        this.advertising = false;
    }
    async setupGatt(maxMtu) {
        await this.init();
        this.gatt = new gatt_1.HciGattLocal(this, this.hci, maxMtu);
        this.gatt.setData(this.deviceName, []);
        return this.gatt;
    }
}
exports.HciAdapter = HciAdapter;
//# sourceMappingURL=Adapter.js.map