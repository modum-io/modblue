"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbusGattServiceRemote = void 0;
const models_1 = require("../../../../models");
class DbusGattServiceRemote extends models_1.GattServiceRemote {
    constructor(gatt, path, uuid) {
        super(gatt, uuid);
        this.characteristics = new Map();
        this.path = path;
    }
}
exports.DbusGattServiceRemote = DbusGattServiceRemote;
//# sourceMappingURL=Service.js.map