/// <reference types="node" />
import { EventEmitter } from 'events';
import { Characteristic } from './Characteristic';
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
    discoverServices(uuids: string[]): Promise<Service[]>;
    discoverSomeServicesAndCharacteristics(serviceUUIDs: string[], characteristicsUUIDs: string[]): Promise<[Service[], Characteristic[]]>;
    discoverAllServicesAndCharacteristics(): Promise<[Service[], Characteristic[]]>;
    readHandle(handle: number): Promise<Buffer>;
    writeHandle(handle: number, data: Buffer, withoutResponse: boolean): Promise<void>;
}
