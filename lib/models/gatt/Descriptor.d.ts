/// <reference types="node" />
import { inspect, InspectOptionsStylized } from 'util';
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
     * The UUID of this descriptor.
     */
    readonly uuid: string;
    constructor(characteristic: GattCharacteristic, uuid: string);
    toString(): string;
    toJSON(): Record<string, unknown>;
    [inspect.custom](depth: number, options: InspectOptionsStylized): string;
}
//# sourceMappingURL=Descriptor.d.ts.map