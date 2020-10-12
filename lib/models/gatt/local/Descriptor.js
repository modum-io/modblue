"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GattDescriptorLocal = void 0;
const Descriptor_1 = require("../Descriptor");
class GattDescriptorLocal extends Descriptor_1.GattDescriptor {
    constructor(characteristic, uuid, value) {
        super(characteristic, uuid);
        this.value = value;
    }
}
exports.GattDescriptorLocal = GattDescriptorLocal;
//# sourceMappingURL=Descriptor.js.map