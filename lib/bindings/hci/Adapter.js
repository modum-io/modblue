"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HciAdapter = void 0;
const models_1 = require("../../models");
const gatt_1 = require("./gatt");
const misc_1 = require("./misc");
const Peripheral_1 = require("./Peripheral");
const SCAN_ENABLE_TIMEOUT = 1000;
const ADVERTISING_ENABLE_TIMEOUT = 1000;
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
        this.onHciStateChange = (newState) => {
            // If the underlaying socket shuts down we're doomed
            if (newState === 'poweredOff') {
                this.dispose();
            }
        };
        this.onHciError = (error) => {
            this.emit('error', error);
            this.hci.reset().catch((err) => this.emit('error', new Error(`Could not reset HCI controller: ${err}`)));
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
                this.scanning = false;
                const enableScanning = () => {
                    this.startScanning()
                        .then(() => {
                        this.scanEnableTimer = null;
                    })
                        .catch((err) => {
                        this.emit('error', new Error(`Could not re-enable LE scanning: ${err}`));
                        this.scanEnableTimer = setTimeout(enableScanning, SCAN_ENABLE_TIMEOUT);
                    });
                };
                enableScanning();
            }
        };
        this.onLeAdvertiseEnable = (enabled) => {
            // We have to restart advertising if we were advertising before
            if (this.advertising && !enabled) {
                this.advertising = false;
                const enableAdvertising = () => {
                    this.startAdvertising(this.deviceName, this.advertisedServiceUUIDs)
                        .then(() => {
                        this.advertisingEnableTimer = null;
                    })
                        .catch((err) => {
                        this.emit('error', new Error(`Could not re-enable LE advertising: ${err}`));
                        this.advertisingEnableTimer = setTimeout(enableAdvertising, ADVERTISING_ENABLE_TIMEOUT);
                    });
                };
                enableAdvertising();
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
            peripheral.onConnect(true, this.hci, handle);
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
                connectedDevice.onDisconnect(reason);
                this.connectedDevices.delete(handle);
                // If the device was connected in master mode we inform our local listeners
                if (connectedDevice.isMaster) {
                    this.emit('disconnect', connectedDevice, reason);
                }
            }
            // We have to restart advertising if we were advertising before, and if all devices disconnected
            if (this.wasAdvertising && this.connectedDevices.size === 0) {
                this.startAdvertising(this.deviceName, this.advertisedServiceUUIDs).catch((err) => this.emit('error', new Error(`Could not re-enable advertising after disconnect: ${err}`)));
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
        this.hci.on('stateChange', this.onHciStateChange);
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
        for (const device of this.connectedDevices.values()) {
            device.onDisconnect('Underlaying adapter disposed');
        }
        this.connectedDevices.clear();
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
        if (this.scanEnableTimer) {
            clearTimeout(this.scanEnableTimer);
            this.scanEnableTimer = null;
        }
        if (!this.scanning) {
            return;
        }
        this.scanning = false;
        await this.gap.stopScanning();
    }
    async getScannedPeripherals() {
        return [...this.peripherals.values()];
    }
    async connect(peripheral, minInterval, maxInterval, latency, supervisionTimeout) {
        // For BLE <= 4.2:
        // - Disable advertising while we're connected.
        // - Don't connect if we have a connection in master mode
        let advertisingWasDisabled = false;
        if (this.hci.hciVersion < 8) {
            if ([...this.connectedDevices.values()].some((d) => d.isMaster)) {
                throw new Error(`Connecting in master & slave role concurrently is only supported in BLE 5+`);
            }
            if (this.advertising) {
                try {
                    await this.stopAdvertising();
                    this.wasAdvertising = true;
                    advertisingWasDisabled = true;
                }
                catch (err) {
                    this.emit('error', new Error(`Could not disable advertising before connecting: ${err}`));
                }
            }
        }
        try {
            const handle = await this.hci.createLeConn(peripheral.address, peripheral.addressType, minInterval, maxInterval, latency, supervisionTimeout);
            this.uuidToHandle.set(peripheral.uuid, handle);
            this.handleToUUID.set(handle, peripheral.uuid);
            peripheral.onConnect(false, this.hci, handle);
            this.connectedDevices.set(handle, peripheral);
        }
        catch (err) {
            // Dispose anything in case we got a partial setup/connection done
            peripheral.onDisconnect();
            // Re-enable advertising since we didn't establish a connection
            if (advertisingWasDisabled) {
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
    async startAdvertising(deviceName, serviceUUIDs = []) {
        await this.init();
        if (this.advertising) {
            return;
        }
        this.deviceName = deviceName;
        this.advertisedServiceUUIDs = serviceUUIDs;
        if (this.gatt) {
            this.gatt.setData(this.deviceName, this.gatt.serviceInputs);
        }
        await this.gap.startAdvertising(this.deviceName, serviceUUIDs);
        this.advertising = true;
    }
    async stopAdvertising() {
        if (this.advertisingEnableTimer) {
            clearTimeout(this.advertisingEnableTimer);
            this.advertisingEnableTimer = null;
        }
        if (!this.advertising) {
            return;
        }
        try {
            await this.gap.stopAdvertising();
        }
        catch (_a) {
            // NO-OP: Errors here probably mean we already stopped advertising
        }
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