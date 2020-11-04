"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HciService = void 0;
const Service_1 = require("../../Service");
const Characteristic_1 = require("./Characteristic");
class HciService extends Service_1.Service {
    constructor(noble, peripheral, uuid, gatt) {
        super(noble, peripheral, uuid);
        this.characteristics = new Map();
        this.gatt = gatt;
    }
    async discoverIncludedServices(serviceUUIDs) {
        return this.peripheral.discoverIncludedServices(this, serviceUUIDs);
    }
    getDiscoveredCharacteristics() {
        return [...this.characteristics.values()];
    }
    async discoverCharacteristics(characteristicUUIDs) {
        const characteristics = await this.gatt.discoverCharacteristics(this.uuid, characteristicUUIDs || []);
        for (const rawCharacteristic of characteristics) {
            let characteristic = this.characteristics.get(rawCharacteristic.uuid);
            if (!characteristic) {
                characteristic = new Characteristic_1.HciCharacteristic(this.noble, this, rawCharacteristic.uuid, rawCharacteristic.properties, this.gatt);
                this.characteristics.set(rawCharacteristic.uuid, characteristic);
            }
        }
        return [...this.characteristics.values()];
    }
}
exports.HciService = HciService;
//# sourceMappingURL=Service.js.map