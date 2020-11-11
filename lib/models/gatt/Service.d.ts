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
     * The UUID of this service, excluding dashes (-).
     */
    readonly uuid: string;
    constructor(gatt: Gatt, uuid: string);
    toString(): string;
}
