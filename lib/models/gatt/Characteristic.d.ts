/// <reference types="node" />
import { TypedEmitter } from 'tiny-typed-emitter';
import { GattDescriptor } from './Descriptor';
import { GattService } from './Service';
export declare type ReadFunction = (offset: number) => Promise<Buffer>;
export declare type WriteFunction = (offset: number, data: Buffer, withoutResponse: boolean) => Promise<number>;
export declare type GattCharacteristicProperty = 'broadcast' | 'read' | 'write-without-response' | 'write' | 'notify' | 'indicate' | 'authenticated-signed-writes' | 'extended-properties' | 'reliable-write' | 'writable-auxiliaries' | 'authorize';
export interface GattCharacteristicEvents {
    notification: (data: Buffer) => void;
}
/**
 * Represents a GATT Characteristic.
 */
export declare abstract class GattCharacteristic extends TypedEmitter<GattCharacteristicEvents> {
    private readonly readFunc;
    private readonly writeFunc;
    /**
     * The GATT service that this characteristic belongs to.
     */
    readonly service: GattService;
    /**
     * The UUID of this characteristic, no dashes (-).
     */
    readonly uuid: string;
    /**
     * True if this is a remote characteristic, false otherwise.
     */
    readonly isRemote: boolean;
    /**
     * A list of all the properties that are enabled/supported for this characteristic.
     */
    readonly properties: GattCharacteristicProperty[];
    /**
     * The list of properties supported by this characteristic as a byte flag per the Bluetooth Core spec.
     */
    readonly propertyFlag: number;
    /**
     * A list of all the properties on this characteristic that are secured.
     */
    readonly secure: GattCharacteristicProperty[];
    /**
     * The list of all secured properties of this characteristic as a byte flag per the Bluetooth Core spec.
     */
    readonly secureFlag: number;
    /**
     * The descriptors that belong to this characteristic, mapped by UUID.
     * If this is a remote characteristic use {@link discoverDescriptors} to discover them.
     */
    readonly descriptors: Map<string, GattDescriptor>;
    constructor(service: GattService, uuid: string, isRemote: boolean, propsOrFlag: number | GattCharacteristicProperty[], secureOrFlag: number | GattCharacteristicProperty[], readFunc?: ReadFunction, writeFunc?: WriteFunction);
    /**
     * Discover all descriptors of this characteristic.
     */
    abstract discoverDescriptors(): Promise<GattDescriptor[]>;
    /**
     * Read the current value of this characteristic.
     */
    abstract read(): Promise<Buffer>;
    /**
     * Write the specified data to this characteristic.
     * @param data The data to write.
     * @param withoutResponse Do not require a response from the remote GATT server for this write.
     */
    abstract write(data: Buffer, withoutResponse: boolean): Promise<void>;
    /**
     * Enable or disable broadcasts.
     * @param broadcast True to enable broadcasts, false otherwise.
     */
    abstract broadcast(broadcast: boolean): Promise<void>;
    /**
     * Enable or disable notifications.
     * @param notify True to enable notifies, false otherwise.
     */
    abstract notify(notify: boolean): Promise<void>;
    /**
     * Enable notifications. Equivalent to calling {@link notify} with `true`.
     */
    subscribe(): Promise<void>;
    /**
     * Disable nofitications. Equivalent to calling {@link notify} with `false`.
     */
    unsubscribe(): Promise<void>;
    handleRead(offset: number): Promise<Buffer>;
    handleWrite(offset: number, data: Buffer, withoutResponse: boolean): Promise<number>;
    toString(): string;
    toJSON(): Record<string, unknown>;
}
//# sourceMappingURL=Characteristic.d.ts.map