import { GattDescriptor } from '../Descriptor';
/**
 * Represents a descriptor of a remote GATT characterstic.
 */
export class GattDescriptorRemote extends GattDescriptor {
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
//# sourceMappingURL=Descriptor.js.map