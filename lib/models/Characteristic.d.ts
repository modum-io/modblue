/// <reference types="node" />
import { EventEmitter } from 'events';
import { Descriptor } from './Descriptor';
import { Noble } from './Noble';
import { Service } from './Service';
export declare abstract class Characteristic<N extends Noble = Noble, S extends Service = Service> extends EventEmitter {
    protected readonly noble: N;
    readonly service: S;
    readonly uuid: string;
    readonly properties: string[];
    constructor(noble: N, service: S, uuid: string, properties: string[]);
    toString(): string;
    abstract read(): Promise<Buffer>;
    abstract write(data: Buffer, withoutResponse: boolean): Promise<void>;
    abstract broadcast(broadcast: boolean): Promise<void>;
    abstract subscribe(): Promise<void>;
    abstract unsubscribe(): Promise<void>;
    abstract getDiscoveredDescriptors(): Descriptor[];
    abstract discoverDescriptors(): Promise<Descriptor[]>;
}
