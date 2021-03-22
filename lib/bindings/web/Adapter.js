"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebAdapter = void 0;
const models_1 = require("../../models");
const Peripheral_1 = require("./Peripheral");
class WebAdapter extends models_1.Adapter {
    constructor(modblue, id, name, address) {
        super(modblue, id, name, address);
        this.peripherals = new Map();
        this.onAdvertisement = ({ device, rssi, manufacturerData }) => {
            const uuid = device.id;
            const adv = {};
            for (const [key, value] of manufacturerData) {
                adv[key] = value;
            }
            let peripheral = this.peripherals.get(uuid);
            if (!peripheral) {
                peripheral = new Peripheral_1.WebPeripheral(this, uuid, adv, rssi);
                this.peripherals.set(uuid, peripheral);
            }
            else {
                peripheral.advertisement = adv;
                peripheral.rssi = rssi;
            }
            this.emit('discover', peripheral);
        };
        navigator.bluetooth.addEventListener('advertisementreceived', this.onAdvertisement);
    }
    dispose() {
        navigator.bluetooth.removeEventListener('advertisementreceived', this.onAdvertisement);
    }
    addDashes(uuid) {
        return (`${uuid.substring(0, 8)}-` +
            `${uuid.substring(8, 12)}-` +
            `${uuid.substring(12, 16)}-` +
            `${uuid.substring(16, 20)}-` +
            `${uuid.substring(20)}`).toLowerCase();
    }
    isScanning() {
        throw new Error('Method not implemented.');
    }
    startScanning(serviceUUIDs) {
        return __awaiter(this, void 0, void 0, function* () {
            const opts = { filters: [] };
            if (serviceUUIDs) {
                // web bluetooth requires 4 char hex service names to be passed in as integers
                const mappedServiceUUIDs = serviceUUIDs.map((service) => {
                    if (service.length === 4) {
                        return parseInt(`0x${service}`);
                    }
                    else if (service.length === 6 && service.indexOf('0x') === 0) {
                        return parseInt(service);
                    }
                    return this.addDashes(service);
                });
                opts.filters = mappedServiceUUIDs.map((srv) => ({ services: [srv] }));
            }
            this.scan = yield navigator.bluetooth.requestLEScan(Object.assign(Object.assign({}, opts), { acceptAllAdvertisements: true }));
        });
    }
    stopScanning() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.scan) {
                this.scan.stop();
                this.scan = null;
            }
        });
    }
    getScannedPeripherals() {
        throw new Error('Method not implemented.');
    }
    isAdvertising() {
        throw new Error('Method not implemented.');
    }
    startAdvertising(deviceName, serviceUUIDs) {
        throw new Error('Method not implemented.');
    }
    stopAdvertising() {
        throw new Error('Method not implemented.');
    }
    setupGatt(maxMtu) {
        throw new Error('Method not implemented.');
    }
}
exports.WebAdapter = WebAdapter;
//# sourceMappingURL=Adapter.js.map