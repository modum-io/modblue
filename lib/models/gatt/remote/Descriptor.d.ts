/// <reference types="node" />
import { GattDescriptor } from '../Descriptor';
import { GattCharacteristicRemote } from './Characteristic';
/**
 * Represents a descriptor of a remote GATT characterstic.
 */
export declare class GattDescriptorRemote extends GattDescriptor {
    /**
     * The remote GATT characteristic that this descriptor belongs to.
     */
    readonly characteristic: GattCharacteristicRemote;
    protected get gatt(): import("./Gatt").GattRemote;
    /**
     * Read the current value of this descriptor.
     */
    readValue(): Promise<Buffer>;
    /**
     * Writes the specified data to this descriptor.
     * @param data The data to write.
     */
    writeValue(data: Buffer): Promise<void>;
}
