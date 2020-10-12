"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Descriptor = void 0;
const Descriptor_1 = require("../../models/gatt/Descriptor");
class Descriptor extends Descriptor_1.GattDescriptor {
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
exports.Descriptor = Descriptor;
//# sourceMappingURL=Descriptor.js.map