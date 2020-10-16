"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbusGattCharacteristicRemote = void 0;
const models_1 = require("../../../../models");
class DbusGattCharacteristicRemote extends models_1.GattCharacteristicRemote {
    constructor(service, path, uuid, properties, secure) {
        super(service, uuid, properties, secure);
        this.path = path;
    }
}
exports.DbusGattCharacteristicRemote = DbusGattCharacteristicRemote;
//# sourceMappingURL=Characteristic.js.map