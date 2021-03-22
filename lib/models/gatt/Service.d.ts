import { GattCharacteristic } from './Characteristic';
import { Gatt } from './Gatt';
/**
 * Represents a GATT service.
 */
export declare class GattService {
    /**
     * The GATT server this service belongs to.
     */
    readonly gatt: Gatt;
    /**
     * The UUID of this service, no dashes (-).
     */
    readonly uuid: string;
    /**
     * True if this is a remote service, false otherwise.
     */
    readonly isRemote: boolean;
    /**
     * The characteristics that belong to this service, mapped by UUID.
     * If this is a remote service use {@link discoverCharacteristics} to discover them.
     */
    readonly characteristics: Map<string, GattCharacteristic>;
    constructor(gatt: Gatt, uuid: string, isRemote: boolean, characteristics?: GattCharacteristic[]);
    /**
     * Discover all charactersitics of this service.
     */
    discoverCharacteristics(): Promise<GattCharacteristic[]>;
    toString(): string;
    toJSON(): Record<string, unknown>;
}
//# sourceMappingURL=Service.d.ts.map