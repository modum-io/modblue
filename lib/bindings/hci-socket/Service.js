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
    async discoverIncludedServices(serviceUUIDs) {
        return this.peripheral.discoverIncludedServices(this, serviceUUIDs);
    }
    discoverCharacteristics(characteristicUUIDs) {
        return new Promise((resolve) => {
            const done = (serviceUUID, characteristics) => {
                if (serviceUUID !== this.uuid) {
                    // This isn't our service, ignore
                    return;
                }
                this.gatt.off('characteristicsDiscovered', done);
                for (const rawCharacteristic of characteristics) {
                    let characteristic = this.characteristics.get(rawCharacteristic.uuid);
                    if (!characteristic) {
                        characteristic = new Characteristic_1.Characteristic(this.noble, this, rawCharacteristic.uuid, rawCharacteristic.properties, this.gatt);
                        this.characteristics.set(rawCharacteristic.uuid, characteristic);
                    }
                }
                resolve([...this.characteristics.values()]);
            };
            this.gatt.on('characteristicsDiscovered', done);
            this.gatt.discoverCharacteristics(this.uuid, characteristicUUIDs || []);
        });
    }
}
exports.Service = Service;
//# sourceMappingURL=Service.js.map