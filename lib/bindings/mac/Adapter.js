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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MacAdapter = void 0;
const events_1 = __importDefault(require("events"));
const util_1 = __importDefault(require("util"));
const models_1 = require("../../models");
const Peripheral_1 = require("./Peripheral");
class MacAdapter extends models_1.Adapter {
    constructor(modblue, id, name) {
        super(modblue, id, name);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.noble = null;
        this.initDone = false;
        this.scanning = false;
        this.peripherals = new Map();
        this.onDiscover = (uuid, address, addressType, connectable, advertisement, rssi) => {
            let peripheral = this.peripherals.get(uuid);
            if (!peripheral) {
                peripheral = new Peripheral_1.MacPeripheral(this, uuid, advertisement.localName, addressType, address, advertisement.manufacturerData, rssi);
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
        // This fixes an issue with webpack trying to load the module at compile time
        const NAME = 'native.node';
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const NobleMac = require(`./${NAME}`).NobleMac;
        util_1.default.inherits(NobleMac, events_1.default.EventEmitter);
        this.noble = new NobleMac();
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
        this.noble.removeAllListeners();
        this.noble.stop();
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
exports.MacAdapter = MacAdapter;
//# sourceMappingURL=Adapter.js.map