"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WinGattService = void 0;
const models_1 = require("../../../models");
const Characteristic_1 = require("./Characteristic");
class WinGattService extends models_1.GattService {
    addCharacteristic() {
        throw new Error('Method not implemented.');
    }
    discoverCharacteristics() {
        const noble = this.gatt.peripheral.adapter.noble;
        this.characteristics.clear();
        noble.discoverCharacteristics(this.gatt.peripheral.uuid, this.uuid);
        return new Promise((resolve) => {
            const handler = (uuid, serviceUUID, characteristics) => {
                if (uuid === this.gatt.peripheral.uuid && serviceUUID === this.uuid) {
                    noble.off('characteristicsDiscover', handler);
                    for (const char of characteristics) {
                        this.characteristics.set(char.uuid, new Characteristic_1.WinGattCharacteristic(this, char.uuid, true, char.properties, []));
                    }
                    resolve([...this.characteristics.values()]);
                }
            };
            noble.on('characteristicsDiscover', handler);
        });
    }
}
exports.WinGattService = WinGattService;
//# sourceMappingURL=Service.js.map