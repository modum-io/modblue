"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Service = void 0;
class Service {
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
exports.Service = Service;
//# sourceMappingURL=Service.js.map