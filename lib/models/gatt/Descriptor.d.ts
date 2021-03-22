/// <reference types="node" />
import { GattCharacteristic } from './Characteristic';
/**
 * Represents a GATT Descriptor.
 */
export declare class GattDescriptor {
    private value;
    private get gatt();
    /**
     * The GATT characteristic that this descriptor belongs to
     */
    readonly characteristic: GattCharacteristic;
    /**
     * The UUID of this descriptor, no dashes (-).
     */
    readonly uuid: string;
    /**
     * True if this is a remote characteristic, false otherwise.
     */
    readonly isRemote: boolean;
    constructor(characteristic: GattCharacteristic, uuid: string, isRemote: boolean, value?: Buffer);
    /**
     * Read the current value of this descriptor.
     */
    read(): Promise<Buffer>;
    /**
     * Writes the specified data to this descriptor.
     * @param data The data to write.
     */
    write(data: Buffer): Promise<void>;
    handleRead(offset: number): Promise<[number, Buffer]>;
    handleWrite(offset: number, data: Buffer): Promise<number>;
    toString(): string;
    toJSON(): Record<string, unknown>;
}
//# sourceMappingURL=Descriptor.d.ts.map