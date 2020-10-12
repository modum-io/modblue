"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbusGattServiceRemote = void 0;
const models_1 = require("../../../../models");
class DbusGattServiceRemote extends models_1.GattServiceRemote {
    constructor(gatt, uuid, busObject) {
        super(gatt, uuid);
        this.characteristics = new Map();
        this.busObject = busObject;
    }
}
exports.DbusGattServiceRemote = DbusGattServiceRemote;
//# sourceMappingURL=Service.js.map