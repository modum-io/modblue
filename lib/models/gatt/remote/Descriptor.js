"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GattDescriptorRemote = void 0;
const Descriptor_1 = require("../Descriptor");
class GattDescriptorRemote extends Descriptor_1.GattDescriptor {
    get gatt() {
        return this.characteristic.service.gatt;
    }
    readValue() {
        return this.gatt.readValue(this.characteristic.service.uuid, this.characteristic.uuid, this.uuid);
    }
    writeValue(data) {
        return this.gatt.writeValue(this.characteristic.service.uuid, this.characteristic.uuid, this.uuid, data);
    }
}
exports.GattDescriptorRemote = GattDescriptorRemote;
//# sourceMappingURL=Descriptor.js.map