"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Service = void 0;
const Service_1 = require("../../Service");
const BusObject_1 = require("./BusObject");
const Characteristic_1 = require("./Characteristic");
class Service extends Service_1.BaseService {
    constructor(noble, peripheral, uuid, object) {
        super(noble, peripheral, uuid);
        this.characteristics = new Map();
        this.object = object;
    }
    async discoverIncludedServices(serviceUUIDs) {
        throw new Error('Method not implemented.');
    }
    getDiscoveredCharacteristics() {
        return [...this.characteristics.values()];
    }
    async discoverCharacteristics(characteristicUUIDs) {
        const characteristicNames = await this.object.getChildrenNames();
        for (const characteristicId of characteristicNames) {
            let characteristic = this.characteristics.get(characteristicId);
            if (!characteristic) {
                const object = this.object.getChild(characteristicId);
                const uuid = (await object.prop(BusObject_1.I_BLUEZ_CHARACTERISTIC, 'UUID')).replace(/\-/g, '');
                const properties = await object.prop(BusObject_1.I_BLUEZ_CHARACTERISTIC, 'Flags');
                characteristic = new Characteristic_1.Characteristic(this.noble, this, uuid, properties, object);
                this.characteristics.set(uuid, characteristic);
            }
        }
        return [...this.characteristics.values()];
    }
}
exports.Service = Service;
//# sourceMappingURL=Service.js.map