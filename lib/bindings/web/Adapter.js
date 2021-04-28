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
    constructor() {
        super(...arguments);
        this.peripherals = new Map();
    }
    dispose() {
        // NO-OP
    }
    isScanning() {
        return false;
    }
    startScanning() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Method not implemented.');
        });
    }
    scanFor(filter, timeoutInSeconds = 10, serviceUUIDs) {
        return __awaiter(this, void 0, void 0, function* () {
            // web bluetooth requires 4 char hex service names to be passed in as integers
            const mappedServiceUUIDs = (serviceUUIDs || []).map((service) => {
                if (service.length === 4) {
                    return parseInt(`0x${service}`);
                }
                else if (service.length === 6 && service.indexOf('0x') === 0) {
                    return parseInt(service);
                }
                return this.addDashes(service);
            });
            let opts;
            if (typeof filter === 'function') {
                opts = { acceptAllDevices: true, optionalServices: mappedServiceUUIDs };
            }
            else {
                opts = { filters: [{ namePrefix: filter }], optionalServices: mappedServiceUUIDs };
            }
            const start = new Date().getTime();
            do {
                const device = yield navigator.bluetooth.requestDevice(opts);
                if (!device) {
                    throw new Error(`No device found`);
                }
                let peripheral = this.peripherals.get(device.id);
                if (!peripheral) {
                    peripheral = new Peripheral_1.WebPeripheral(this, device);
                    this.peripherals.set(device.id, peripheral);
                }
                if (typeof filter === 'function' && !filter(peripheral)) {
                    throw new Error(`Device not found`);
                }
                return peripheral;
            } while (start + timeoutInSeconds * 1000 >= new Date().getTime());
        });
    }
    stopScanning() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Method not implemented.');
        });
    }
    getScannedPeripherals() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Method not implemented.');
        });
    }
    isAdvertising() {
        throw new Error('Method not implemented.');
    }
    startAdvertising() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Method not implemented.');
        });
    }
    stopAdvertising() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Method not implemented.');
        });
    }
    setupGatt() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Method not implemented.');
        });
    }
    addDashes(uuid) {
        return (`${uuid.substring(0, 8)}-` +
            `${uuid.substring(8, 12)}-` +
            `${uuid.substring(12, 16)}-` +
            `${uuid.substring(16, 20)}-` +
            `${uuid.substring(20)}`).toLowerCase();
    }
}
exports.WebAdapter = WebAdapter;
//# sourceMappingURL=Adapter.js.map