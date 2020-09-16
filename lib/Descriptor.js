"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseDescriptor = void 0;
class BaseDescriptor {
    constructor(noble, characteristic, uuid) {
        this.noble = noble;
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
exports.BaseDescriptor = BaseDescriptor;
//# sourceMappingURL=Descriptor.js.map