/// <reference types="node" />
import { BaseCharacteristic } from '../../Characteristic';
import { BaseDescriptor } from '../../Descriptor';
import { BusObject } from './BusObject';
import { Noble } from './Noble';
import { Service } from './Service';
export declare class Characteristic extends BaseCharacteristic<Noble, Service> {
    private readonly object;
    constructor(noble: Noble, service: Service, uuid: string, properties: string[], object: BusObject);
    private prop;
    private callMethod;
    read(offset?: number): Promise<Buffer>;
    write(data: Buffer, withoutResponse: boolean): Promise<void>;
    broadcast(broadcast: boolean): Promise<void>;
    subscribe(): Promise<void>;
    unsubscribe(): Promise<void>;
    getDiscoveredDescriptors(): BaseDescriptor<Noble, Characteristic>[];
    discoverDescriptors(): Promise<BaseDescriptor<Noble, Characteristic>[]>;
}
