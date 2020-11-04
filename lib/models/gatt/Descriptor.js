"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GattDescriptor = void 0;
class GattDescriptor {
    constructor(characteristic, uuid) {
        this.characteristic = characteristic;
        this.uuid = uuid;
    }
    toString() {
        return JSON.stringify({
            characteristicUUID: this.characteristic.uuid,
            uuid: this.uuid
        });
    }
}
exports.GattDescriptor = GattDescriptor;
//# sourceMappingURL=Descriptor.js.map