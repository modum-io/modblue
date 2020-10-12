/// <reference types="node" />
import { EventEmitter } from 'events';
import { GattService } from './Service';
export declare type GattCharacteristicProperty = 'broadcast' | 'read' | 'writeWithoutResponse' | 'write' | 'notify' | 'indicate' | 'authenticatedSignedWrites' | 'extendedProperties';
export declare abstract class GattCharacteristic extends EventEmitter {
    readonly service: GattService;
    readonly uuid: string;
    readonly properties: GattCharacteristicProperty[];
    constructor(service: GattService, uuid: string, properties: GattCharacteristicProperty[]);
    toString(): string;
}
