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
exports.WinAdapter = void 0;
const models_1 = require("../../models");
const bindings_1 = require("./bindings");
const Peripheral_1 = require("./Peripheral");
class WinAdapter extends models_1.Adapter {
    constructor(modblue, radio) {
        super(modblue, radio.name, radio.name);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.noble = null;
        this.initDone = false;
        this.scanning = false;
        this.peripherals = new Map();
        this.onDiscover = (uuid, address, addressType, connectable, advertisement, rssi) => {
            let peripheral = this.peripherals.get(uuid);
            if (!peripheral) {
                peripheral = new Peripheral_1.WinPeripheral(this, uuid, advertisement.localName, addressType, address, advertisement.manufacturerData, rssi);
            }
            else {
                peripheral.name = advertisement.localName;
                peripheral.manufacturerData = advertisement.manufacturerData;
            }
            this.emit('discover', peripheral);
        };
        this.onNotification = (uuid, serviceUUID, charUUID, data, isNotification) => {
            if (isNotification) {
                const peripheral = this.peripherals.get(uuid);
                if (peripheral) {
                    const service = peripheral.gatt.services.get(serviceUUID);
                    if (service) {
                        const char = service.characteristics.get(charUUID);
                        if (char) {
                            char.emit('notification', data);
                        }
                    }
                }
            }
        };
        this.noble = new bindings_1.NobleBindings(radio);
    }
    isScanning() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.scanning;
        });
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.initDone) {
                return;
            }
            yield new Promise((resolve, reject) => {
                this.noble.on('stateChange', (state) => {
                    if (state === 'poweredOn') {
                        resolve();
                    }
                    else {
                        reject(new Error(`State was ${state}`));
                    }
                });
                this.noble.init();
            });
            this.noble.on('read', this.onNotification);
            this.initDone = true;
        });
    }
    dispose() {
        this.noble.stopScanning();
        this.noble.removeAllListeners();
    }
    startScanning(serviceUUIDs, allowDuplicates) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.init();
            this.peripherals.clear();
            this.noble.startScanning(serviceUUIDs, allowDuplicates);
            this.noble.on('discover', this.onDiscover);
            this.scanning = true;
        });
    }
    stopScanning() {
        return __awaiter(this, void 0, void 0, function* () {
            this.noble.stopScanning();
            this.scanning = false;
        });
    }
    getScannedPeripherals() {
        return __awaiter(this, void 0, void 0, function* () {
            return [...this.peripherals.values()];
        });
    }
    isAdvertising() {
        throw new Error('Method not implemented.');
    }
    startAdvertising() {
        throw new Error('Method not implemented.');
    }
    stopAdvertising() {
        throw new Error('Method not implemented.');
    }
    setupGatt() {
        throw new Error('Method not implemented.');
    }
}
exports.WinAdapter = WinAdapter;
//# sourceMappingURL=Adapter.js.map