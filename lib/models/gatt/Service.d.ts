/// <reference types="node" />
import { inspect } from 'util';
import { Gatt } from './Gatt';
/**
 * Represents a GATT service.
 */
export declare abstract class GattService {
    /**
     * The GATT server this service belongs to.
     */
    readonly gatt: Gatt;
    /**
     * The UUID of this service, no dashes (-).
     */
    readonly uuid: string;
    constructor(gatt: Gatt, uuid: string);
    toString(): string;
    toJSON(): Record<string, unknown>;
    [inspect.custom](depth: number, options: any): string;
}
//# sourceMappingURL=Service.d.ts.map