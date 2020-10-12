/// <reference types="node" />
import { GattCharacteristic } from '../../GattCharacteristic';
import { GattDescriptor } from '../../models/gatt/Descriptor';
import { Gatt } from './gatt';
import { Noble } from './Noble';
import { Service } from './Service';
export declare class Characteristic extends GattCharacteristic<Noble, Service> {
    private gatt;
    private descriptors;
    constructor(noble: Noble, service: Service, uuid: string, properties: string[], gatt: Gatt);
    read(): Promise<Buffer>;
    write(data: Buffer, withoutResponse: boolean): Promise<void>;
    broadcast(broadcast: boolean): Promise<void>;
    notify(notify: boolean): Promise<void>;
    subscribe(): Promise<void>;
    unsubscribe(): Promise<void>;
    getDiscoveredDescriptors(): GattDescriptor[];
    discoverDescriptors(uuids?: string[]): Promise<GattDescriptor[]>;
}
