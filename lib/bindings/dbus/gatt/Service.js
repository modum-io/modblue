"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbusGattService = void 0;
const models_1 = require("../../../models");
class DbusGattService extends models_1.GattService {
    constructor(gatt, uuid, isRemote, path) {
        super(gatt, uuid, isRemote);
        this.characteristics = new Map();
        this.path = path;
    }
}
exports.DbusGattService = DbusGattService;
//# sourceMappingURL=Service.js.map