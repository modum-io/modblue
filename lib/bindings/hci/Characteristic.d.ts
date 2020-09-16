/// <reference types="node" />
import { BaseCharacteristic } from '../../Characteristic';
import { Descriptor } from './Descriptor';
import { Gatt } from './gatt';
import { Noble } from './Noble';
import { Service } from './Service';
export declare class Characteristic extends BaseCharacteristic<Noble, Service> {
    private gatt;
    private descriptors;
    getDiscoveredDescriptors(): Descriptor[];
    constructor(noble: Noble, service: Service, uuid: string, properties: string[], gatt: Gatt);
    read(): Promise<Buffer>;
    write(data: Buffer, withoutResponse: boolean): Promise<void>;
    broadcast(broadcast: boolean): Promise<boolean>;
    notify(notify: boolean): Promise<boolean>;
    subscribe(): Promise<void>;
    unsubscribe(): Promise<void>;
    discoverDescriptors(): Promise<Descriptor[]>;
}
