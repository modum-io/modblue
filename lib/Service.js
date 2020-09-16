"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseService = void 0;
class BaseService {
    constructor(noble, peripheral, uuid) {
        this.noble = noble;
        this.peripheral = peripheral;
        this.uuid = uuid;
    }
    toString() {
        return JSON.stringify({
            peripheralUUID: this.peripheral.uuid,
            uuid: this.uuid
        });
    }
}
exports.BaseService = BaseService;
//# sourceMappingURL=Service.js.map