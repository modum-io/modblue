/// <reference types="node" />
import { TypedEmitter } from 'tiny-typed-emitter';
import { inspect, InspectOptionsStylized } from 'util';
import { GattService } from './Service';
export declare type GattCharacteristicProperty = 'broadcast' | 'read' | 'write-without-response' | 'write' | 'notify' | 'indicate' | 'authenticated-signed-writes' | 'extended-properties' | 'reliable-write' | 'writable-auxiliaries' | 'authorize';
export interface GattCharacteristicEvents {
    notification: (data: Buffer) => void;
}
/**
 * Represents a GATT Characteristic.
 */
export declare abstract class GattCharacteristic extends TypedEmitter<GattCharacteristicEvents> {
    /**
     * The GATT service that this characteristic belongs to.
     */
    readonly service: GattService;
    /**
     * The UUID of this characteristic.
     */
    readonly uuid: string;
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
    constructor(service: GattService, uuid: string, propsOrFlag: number | GattCharacteristicProperty[], secureOrFlag: number | GattCharacteristicProperty[]);
    toString(): string;
    toJSON(): {
        uuid: string;
        properties: GattCharacteristicProperty[];
        secure: GattCharacteristicProperty[];
        service: GattService;
    };
    [inspect.custom](depth: number, options: InspectOptionsStylized): string;
}
//# sourceMappingURL=Characteristic.d.ts.map