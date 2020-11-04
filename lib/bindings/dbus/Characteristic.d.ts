/// <reference types="node" />
import { Characteristic } from '../../Characteristic';
import { Descriptor } from '../../Descriptor';
import { BusObject } from './BusObject';
import { DbusNoble } from './Noble';
import { DbusService } from './Service';
export declare class DbusCharacteristic extends Characteristic<DbusNoble, DbusService> {
    private readonly object;
    constructor(noble: DbusNoble, service: DbusService, uuid: string, properties: string[], object: BusObject);
    private prop;
    private callMethod;
    read(offset?: number): Promise<Buffer>;
    write(data: Buffer, withoutResponse: boolean): Promise<void>;
    broadcast(broadcast: boolean): Promise<void>;
    subscribe(): Promise<void>;
    unsubscribe(): Promise<void>;
    getDiscoveredDescriptors(): Descriptor[];
    discoverDescriptors(): Promise<Descriptor[]>;
}
