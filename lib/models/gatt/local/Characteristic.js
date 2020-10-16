"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GattCharacteristicLocal = void 0;
const Characteristic_1 = require("../Characteristic");
class GattCharacteristicLocal extends Characteristic_1.GattCharacteristic {
    constructor(service, uuid, properties, secure, readFunc, writeFunc, descriptors) {
        super(service, uuid, properties, secure);
        this.descriptors = descriptors;
        this.readFunc = readFunc;
        this.writeFunc = writeFunc;
    }
    async readRequest(offset) {
        return this.readFunc(offset);
    }
    async writeRequest(offset, data, withoutResponse) {
        return this.writeFunc(offset, data, withoutResponse);
    }
}
exports.GattCharacteristicLocal = GattCharacteristicLocal;
//# sourceMappingURL=Characteristic.js.map