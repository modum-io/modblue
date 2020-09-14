/// <reference types="node" />
import { EventEmitter } from 'events';
import { Noble } from './Noble';
import { Service } from './Service';
export declare class Peripheral extends EventEmitter {
    private noble;
    readonly uuid: string;
    state: string;
    address: string;
    addressType: string;
    connectable: boolean;
    advertisement: any;
    rssi: number;
    mtu: number;
    services: Map<string, Service>;
    constructor(noble: Noble, uuid: string, address: string, addressType: string, connectable: boolean, advertisement: any, rssi: number);
    toString(): string;
    connect(requestMtu?: number): Promise<void>;
    disconnect(): Promise<string>;
    updateRSSI(): Promise<number>;
    discoverServices(uuids: string[]): Promise<any[]>;
    discoverSomeServicesAndCharacteristics(serviceUUIDs: string[], characteristicsUUIDs: string[]): Promise<any[]>;
    discoverAllServicesAndCharacteristics(): Promise<void>;
    readHandle(handle: number): Promise<Buffer>;
    writeHandle(handle: number, data: Buffer, withoutResponse: boolean): Promise<void>;
}
