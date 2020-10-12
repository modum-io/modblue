"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GattServiceLocal = void 0;
const Service_1 = require("../Service");
class GattServiceLocal extends Service_1.GattService {
    constructor(gatt, uuid, characteristics) {
        super(gatt, uuid);
        this.characteristics = characteristics;
    }
}
exports.GattServiceLocal = GattServiceLocal;
//# sourceMappingURL=Service.js.map