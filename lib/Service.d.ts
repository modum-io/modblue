/// <reference types="node" />
import { EventEmitter } from 'events';
import { Characteristic } from './Characteristic';
import { Noble } from './Noble';
export declare class Service extends EventEmitter {
    private readonly noble;
    private readonly peripheralUUID;
    readonly uuid: string;
    readonly name: string;
    readonly type: string;
    includedServiceUUIDs: string[];
    characteristics: Map<string, Characteristic>;
    constructor(noble: Noble, peripheralUUID: string, uuid: string);
    toString(): string;
    discoverIncludedServices(serviceUUIDs: string[]): Promise<string[]>;
    discoverCharacteristics(characteristicUUIDs: string[]): Promise<Map<string, Characteristic>>;
}
