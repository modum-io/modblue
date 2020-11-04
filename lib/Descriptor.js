"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Descriptor = void 0;
class Descriptor {
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
exports.Descriptor = Descriptor;
//# sourceMappingURL=Descriptor.js.map