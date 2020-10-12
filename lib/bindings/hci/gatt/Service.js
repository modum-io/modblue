"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HciService = void 0;
const models_1 = require("../../../models");
class HciService extends models_1.GattServiceRemote {
    constructor(gatt, uuid, startHandle, endHandle) {
        super(gatt, uuid);
        this.characteristics = new Map();
        this.startHandle = startHandle;
        this.endHandle = endHandle;
    }
}
exports.HciService = HciService;
//# sourceMappingURL=Service.js.map