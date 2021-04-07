/// <reference types="node" />
import { GattCharacteristic, GattCharacteristicProperty, ReadFunction, WriteFunction } from './Characteristic';
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
    /**
     * True if this is a remote service, false otherwise.
     */
    readonly isRemote: boolean;
    /**
     * The characteristics that belong to this service, mapped by UUID.
     * If this is a remote service use {@link discoverCharacteristics} to discover them.
     */
    readonly characteristics: Map<string, GattCharacteristic>;
    constructor(gatt: Gatt, uuid: string, isRemote: boolean);
    /**
     * Local only: Add a new characteristic to this service
     */
    abstract addCharacteristic(uuid: string, props: GattCharacteristicProperty[], secure: GattCharacteristicProperty[], value?: Buffer): Promise<GattCharacteristic>;
    /**
     * Local only: Add a new characteristic to this service
     */
    abstract addCharacteristic(uuid: string, props: GattCharacteristicProperty[], secure: GattCharacteristicProperty[], readFunc?: ReadFunction, writeFunc?: WriteFunction): Promise<GattCharacteristic>;
    /**
     * Remote only: Discover all charactersitics of this service.
     */
    abstract discoverCharacteristics(): Promise<GattCharacteristic[]>;
    toString(): string;
    toJSON(): Record<string, unknown>;
}
//# sourceMappingURL=Service.d.ts.map