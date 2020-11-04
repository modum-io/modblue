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
        this.peripherals = new Map();
        this.uuidToHandle = new Map();
        this.handleToUUID = new Map();
        this.onDiscover = (status, address, addressType, connectable, advertisement, rssi) => {
            address = address.toUpperCase();
            const uuid = address;
            let peripheral = this.peripherals.get(uuid);
            if (!peripheral) {
                peripheral = new Peripheral_1.HciPeripheral(this, uuid, address, addressType, advertisement, rssi);
                this.peripherals.set(uuid, peripheral);
            }
            else {
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
        this.hci = new misc_1.Hci(Number(this.id));
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
    async startAdvertising(deviceName, serviceUUIDs) {
        await this.init();
        if (this.advertising) {
            return;
        }
        this.deviceName = deviceName;
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