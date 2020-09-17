"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Service = void 0;
const Service_1 = require("../../Service");
const Characteristic_1 = require("./Characteristic");
class Service extends Service_1.BaseService {
    constructor(noble, peripheral, uuid, gatt) {
        super(noble, peripheral, uuid);
        this.characteristics = new Map();
        this.gatt = gatt;
    }
    getDiscoveredCharacteristics() {
        return [...this.characteristics.values()];
    }
    async discoverIncludedServices(serviceUUIDs) {
        return this.peripheral.discoverIncludedServices(this, serviceUUIDs);
    }
    async discoverCharacteristics(characteristicUUIDs) {
        const characteristics = await this.gatt.discoverCharacteristics(this.uuid, characteristicUUIDs || []);
        for (const rawCharacteristic of characteristics) {
            let characteristic = this.characteristics.get(rawCharacteristic.uuid);
            if (!characteristic) {
                characteristic = new Characteristic_1.Characteristic(this.noble, this, rawCharacteristic.uuid, rawCharacteristic.properties, this.gatt);
                this.characteristics.set(rawCharacteristic.uuid, characteristic);
            }
        }
        return [...this.characteristics.values()];
    }
}
exports.Service = Service;
//# sourceMappingURL=Service.js.map