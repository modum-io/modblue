"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbusGattCharacteristic = void 0;
const models_1 = require("../../../models");
class DbusGattCharacteristic extends models_1.GattCharacteristic {
    constructor(service, uuid, isRemote, properties, secure, path) {
        super(service, uuid, isRemote, properties, secure);
        this.path = path;
    }
}
exports.DbusGattCharacteristic = DbusGattCharacteristic;
//# sourceMappingURL=Characteristic.js.map