"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GattService = void 0;
class GattService {
    constructor(gatt, uuid) {
        this.gatt = gatt;
        this.uuid = uuid;
    }
    toString() {
        return JSON.stringify({
            uuid: this.uuid
        });
    }
}
exports.GattService = GattService;
//# sourceMappingURL=Service.js.map