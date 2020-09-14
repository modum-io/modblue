/// <reference types="node" />
import { EventEmitter } from 'events';
import { Descriptor } from './Descriptor';
import { Noble } from './Noble';
export declare class Characteristic extends EventEmitter {
    private noble;
    private peripheralUUID;
    private serviceUUID;
    readonly uuid: string;
    readonly name: string;
    readonly type: string;
    properties: any;
    descriptors: Map<string, Descriptor>;
    constructor(noble: Noble, peripheralUUID: string, serviceUUID: string, uuid: string, properties: any);
    toString(): string;
    read(): Promise<Buffer>;
    write(data: Buffer, withoutResponse: boolean): Promise<void>;
    broadcast(broadcast: any): Promise<void>;
    notify(notify: boolean): Promise<void>;
    subscribe(): Promise<void>;
    unsubscribe(): Promise<void>;
    discoverDescriptors(): Promise<any[]>;
}
