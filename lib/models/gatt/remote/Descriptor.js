"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GattDescriptorRemote = void 0;
const Descriptor_1 = require("../Descriptor");
/**
 * Represents a descriptor of a remote GATT characterstic.
 */
class GattDescriptorRemote extends Descriptor_1.GattDescriptor {
    get gatt() {
        return this.characteristic.service.gatt;
    }
    /**
     * Read the current value of this descriptor.
     */
    readValue() {
        return this.gatt.readValue(this.characteristic.service.uuid, this.characteristic.uuid, this.uuid);
    }
    /**
     * Writes the specified data to this descriptor.
     * @param data The data to write.
     */
    writeValue(data) {
        return this.gatt.writeValue(this.characteristic.service.uuid, this.characteristic.uuid, this.uuid, data);
    }
}
exports.GattDescriptorRemote = GattDescriptorRemote;
//# sourceMappingURL=Descriptor.js.map