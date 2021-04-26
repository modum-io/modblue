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
        return new Promise((resolve, reject) => {
            const handler = (uuid, serviceUUID, characteristics) => {
                if (uuid === this.gatt.peripheral.uuid && serviceUUID === this.uuid) {
                    noble.off('characteristicsDiscover', handler);
                    if (characteristics instanceof Error) {
                        reject(characteristics);
                    }
                    else {
                        for (const char of characteristics) {
                            this.characteristics.set(char.uuid, new Characteristic_1.WinGattCharacteristic(this, char.uuid, true, char.properties, []));
                        }
                        resolve([...this.characteristics.values()]);
                    }
                }
            };
            noble.on('characteristicsDiscover', handler);
            this.characteristics.clear();
            noble.discoverCharacteristics(this.gatt.peripheral.uuid, this.uuid);
        });
    }
}
exports.WinGattService = WinGattService;
//# sourceMappingURL=Service.js.map