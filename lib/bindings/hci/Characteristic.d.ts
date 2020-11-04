/// <reference types="node" />
import { Characteristic } from '../../Characteristic';
import { Descriptor } from '../../Descriptor';
import { Gatt } from './gatt';
import { HciNoble } from './Noble';
import { HciService } from './Service';
export declare class HciCharacteristic extends Characteristic<HciNoble, HciService> {
    private gatt;
    private descriptors;
    constructor(noble: HciNoble, service: HciService, uuid: string, properties: string[], gatt: Gatt);
    read(): Promise<Buffer>;
    write(data: Buffer, withoutResponse: boolean): Promise<void>;
    broadcast(broadcast: boolean): Promise<void>;
    notify(notify: boolean): Promise<void>;
    subscribe(): Promise<void>;
    unsubscribe(): Promise<void>;
    getDiscoveredDescriptors(): Descriptor[];
    discoverDescriptors(uuids?: string[]): Promise<Descriptor[]>;
}
