"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HciDescriptor = void 0;
const Descriptor_1 = require("../../Descriptor");
class HciDescriptor extends Descriptor_1.Descriptor {
    constructor(noble, characteristic, uuid, gatt) {
        super(noble, characteristic, uuid);
        this.gatt = gatt;
    }
    readValue() {
        return this.gatt.readValue(this.characteristic.service.uuid, this.characteristic.uuid, this.uuid);
    }
    writeValue(data) {
        return this.gatt.writeValue(this.characteristic.service.uuid, this.characteristic.uuid, this.uuid, data);
    }
}
exports.HciDescriptor = HciDescriptor;
//# sourceMappingURL=Descriptor.js.map