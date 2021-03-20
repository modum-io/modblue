/// <reference types="node" />
import { inspect } from 'util';
import { GattCharacteristic } from './Characteristic';
/**
 * Represents a GATT Descriptor.
 */
export declare abstract class GattDescriptor {
    /**
     * The GATT characteristic that this descriptor belongs to
     */
    readonly characteristic: GattCharacteristic;
    /**
     * The UUID of this descriptor, no dashes (-).
     */
    readonly uuid: string;
    constructor(characteristic: GattCharacteristic, uuid: string);
    toString(): string;
    toJSON(): Record<string, unknown>;
    [inspect.custom](depth: number, options: any): string;
}
//# sourceMappingURL=Descriptor.d.ts.map