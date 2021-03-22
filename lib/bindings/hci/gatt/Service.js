"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HciGattService = void 0;
const models_1 = require("../../../models");
class HciGattService extends models_1.GattService {
    constructor(gatt, uuid, isRemote, startHandle, endHandle) {
        super(gatt, uuid, isRemote);
        this.characteristics = new Map();
        this.startHandle = startHandle;
        this.endHandle = endHandle;
    }
}
exports.HciGattService = HciGattService;
//# sourceMappingURL=Service.js.map