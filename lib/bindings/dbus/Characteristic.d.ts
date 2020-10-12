/// <reference types="node" />
import { GattCharacteristic } from '../../GattCharacteristic';
import { GattDescriptor } from '../../models/gatt/Descriptor';
import { BusObject } from './BusObject';
import { Noble } from './Noble';
import { Service } from './Service';
export declare class Characteristic extends GattCharacteristic<Noble, Service> {
    private readonly object;
    constructor(noble: Noble, service: Service, uuid: string, properties: string[], object: BusObject);
    private prop;
    private callMethod;
    read(offset?: number): Promise<Buffer>;
    write(data: Buffer, withoutResponse: boolean): Promise<void>;
    broadcast(broadcast: boolean): Promise<void>;
    subscribe(): Promise<void>;
    unsubscribe(): Promise<void>;
    getDiscoveredDescriptors(): GattDescriptor[];
    discoverDescriptors(): Promise<GattDescriptor[]>;
}
