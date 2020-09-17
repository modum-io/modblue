/// <reference types="node" />
import { EventEmitter } from 'events';
import { BaseDescriptor } from './Descriptor';
import { BaseNoble } from './Noble';
import { BaseService } from './Service';
export declare abstract class BaseCharacteristic<N extends BaseNoble = BaseNoble, S extends BaseService = BaseService> extends EventEmitter {
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
    abstract getDiscoveredDescriptors(): BaseDescriptor[];
    abstract discoverDescriptors(): Promise<BaseDescriptor[]>;
}
