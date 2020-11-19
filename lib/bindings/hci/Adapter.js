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
        this.deviceName = this.id;
        this.advertisedServiceUUIDs = [];
        this.peripherals = new Map();
        this.connectedDevices = new Map();
        this.uuidToHandle = new Map();
        this.handleToUUID = new Map();
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
        this.onLeScanEnable = async (enabled, filterDuplicates) => {
            // We have to restart scanning if we were scanning before
            if (this.scanning && !enabled) {
                this.scanning = false;
                await this.startScanning();
            }
        };
        this.onLeConnComplete = async (status, handle, role, addressType, address) => {
            // Skip failed or master connections, they are handled elsewhere
            if (status !== 0 || role === 0) {
                return;
            }
            address = address.toUpperCase();
            const uuid = address;
            const peripheral = new Peripheral_1.HciPeripheral(this, uuid, addressType, address, null, 0);
            this.connectedDevices.set(handle, peripheral);
            this.emit('connect', peripheral);
        };
        this.onDisconnectComplete = async (status, handle, reason) => {
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
    async init() {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        this.hci = new misc_1.Hci(Number(this.id));
        this.hci.on('leScanEnable', this.onLeScanEnable);
        this.hci.on('leConnComplete', this.onLeConnComplete);
        this.hci.on('disconnectComplete', this.onDisconnectComplete);
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
        await this.gap.stopScanning();
        this.scanning = false;
    }
    async getScannedPeripherals() {
        return [...this.peripherals.values()];
    }
    async connect(peripheral) {
        // Advertising & connecting simultaneously is only supported with Bluetooth 4.2+
        if (this.hci.hciVersion < 8 && this.advertising) {
            throw new Error(`Advertising and connecting simultaneously is supported with Bluetooth 4.2+`);
        }
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connecting timed out')), 10000));
        const connet = async () => {
            const handle = await this.hci.createLeConn(peripheral.address, peripheral.addressType);
            this.uuidToHandle.set(peripheral.uuid, handle);
            this.handleToUUID.set(handle, peripheral.uuid);
            await peripheral.onConnect(this.hci, handle);
            return true;
        };
        try {
            await Promise.race([connet(), timeout]);
        }
        catch (err) {
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
        }
        catch (_a) {
            // NO-OP
        }
        await peripheral.onDisconnect();
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