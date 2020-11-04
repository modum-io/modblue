"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HciDescriptor = void 0;
const models_1 = require("../../models");
class HciDescriptor extends models_1.Descriptor {
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