/// <reference types="node" />
import { EventEmitter } from 'events';
import { GattService } from './Service';
export declare type GattCharacteristicProperty = 'broadcast' | 'read' | 'write-without-response' | 'write' | 'notify' | 'indicate' | 'authenticated-signed-writes' | 'extended-properties' | 'reliable-write' | 'writable-auxiliaries' | 'authorize';
export declare abstract class GattCharacteristic extends EventEmitter {
    readonly service: GattService;
    readonly uuid: string;
    readonly properties: GattCharacteristicProperty[];
    readonly propertyFlag: number;
    readonly secure: GattCharacteristicProperty[];
    readonly secureFlag: number;
    constructor(service: GattService, uuid: string, propsOrFlag: number | GattCharacteristicProperty[], secureOrFlag: number | GattCharacteristicProperty[]);
    toString(): string;
}
