"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GattCharacteristicLocal = void 0;
const Characteristic_1 = require("../Characteristic");
class GattCharacteristicLocal extends Characteristic_1.GattCharacteristic {
    constructor(service, uuid, properties, descriptors) {
        super(service, uuid, properties);
        this.descriptors = descriptors;
    }
}
exports.GattCharacteristicLocal = GattCharacteristicLocal;
//# sourceMappingURL=Characteristic.js.map