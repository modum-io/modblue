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
exports.MacAdapter = void 0;
const models_1 = require("../../models");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const NobleMac = require('./native/binding').NobleMac;
class MacAdapter extends models_1.Adapter {
    constructor(modblue, id, name) {
        super(modblue, id, name);
        this.noble = null;
        this.scanning = false;
        this.noble = new NobleMac();
    }
    isScanning() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.scanning;
        });
    }
    dispose() {
        this.noble.Stop();
    }
    startScanning(serviceUUIDs, allowDuplicates) {
        return __awaiter(this, void 0, void 0, function* () {
            this.noble.Scan(serviceUUIDs, allowDuplicates);
            this.scanning = true;
        });
    }
    stopScanning() {
        return __awaiter(this, void 0, void 0, function* () {
            this.noble.StopScan();
            this.scanning = false;
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
exports.MacAdapter = MacAdapter;
//# sourceMappingURL=Adapter.js.map