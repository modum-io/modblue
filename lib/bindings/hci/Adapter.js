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
        this.requestScanStop = false;
        this.peripherals = new Map();
        this.uuidToHandle = new Map();
        this.handleToUUID = new Map();
        this.connectionRequestQueue = [];
        this.onScanStart = () => {
            this.scanning = true;
        };
        this.onScanStop = () => {
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
        this.onLeConnComplete = async (status, handle, role, addressType, address, interval, latency, supervisionTimeout, masterClockAccuracy) => {
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
            }
            else {
                const statusMessage = (misc_1.Hci.STATUS_MAPPER[status] || 'HCI Error: Unknown') + ` (0x${status.toString(16)})`;
                if (!request.isDone) {
                    request.reject(new Error(statusMessage));
                }
            }
            this.connectionRequest = null;
            this.processConnectionRequests();
        };
        this.onAdvertisingStart = () => {
            this.advertising = true;
        };
        this.onAdvertisingStop = () => {
            this.advertising = false;
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
        this.hci.on('addressChange', (addr) => (this._address = addr));
        this.hci.on('leConnComplete', this.onLeConnComplete);
        this.gap = new misc_1.Gap(this.hci);
        this.gap.on('scanStart', this.onScanStart);
        this.gap.on('scanStop', this.onScanStop);
        this.gap.on('discover', this.onDiscover);
        this.gap.on('advertisingStart', this.onAdvertisingStart);
        this.gap.on('advertisingStop', this.onAdvertisingStop);
        this.gatt = new gatt_1.HciGattLocal(this);
        await this.hci.init();
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
        return new Promise((resolve) => {
            const done = () => {
                this.gap.off('scanStart', done);
                resolve();
            };
            this.gap.on('scanStart', done);
            this.gap.startScanning(true);
        });
    }
    async stopScanning() {
        if (!this.scanning) {
            return;
        }
        return new Promise((resolve) => {
            const done = () => {
                this.gap.off('scanStop', done);
                resolve();
            };
            this.gap.on('scanStop', done);
            this.requestScanStop = true;
            this.gap.stopScanning();
        });
    }
    async connect(peripheral) {
        const request = { peripheral, isDone: false };
        const disconnect = (disconnHandle, reason) => {
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
        return new Promise((res, rej) => {
            request.resolve = () => {
                request.isDone = true;
                res();
            };
            request.reject = (error) => {
                request.isDone = true;
                rej(error);
            };
        });
    }
    processConnectionRequests() {
        if (this.connectionRequest) {
            return;
        }
        if (this.connectionRequestQueue.length > 0) {
            const newRequest = this.connectionRequestQueue.shift();
            this.connectionRequest = newRequest;
            this.hci.createLeConn(newRequest.peripheral.address, newRequest.peripheral.addressType);
        }
    }
    async disconnect(peripheral) {
        const handle = this.uuidToHandle.get(peripheral.uuid);
        return new Promise((resolve) => {
            const done = (disconnHandle, reason) => {
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
    async startAdvertising(deviceName, serviceUUIDs) {
        await this.init();
        if (this.advertising) {
            return;
        }
        return new Promise((resolve) => {
            const done = () => {
                this.gap.off('advertisingStart', done);
                resolve();
            };
            this.gap.on('advertisingStart', done);
            this.gap.startAdvertising(this.gatt.deviceName, serviceUUIDs || []);
        });
    }
    async stopAdvertising() {
        if (!this.advertising) {
            return;
        }
        return new Promise((resolve) => {
            const done = () => {
                this.gap.off('advertisingStop', done);
                resolve();
            };
            this.gap.on('advertisingStop', done);
            this.gap.stopAdvertising();
        });
    }
}
exports.HciAdapter = HciAdapter;
//# sourceMappingURL=Adapter.js.map