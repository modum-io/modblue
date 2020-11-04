/// <reference types="node" />
import { GattCharacteristic } from '../Characteristic';
import { GattDescriptorRemote } from './Descriptor';
import { GattServiceRemote } from './Service';
export declare class GattCharacteristicRemote extends GattCharacteristic {
    readonly service: GattServiceRemote;
    protected get gatt(): import("./Gatt").GattRemote;
    readonly descriptors: Map<string, GattDescriptorRemote>;
    read(): Promise<Buffer>;
    write(data: Buffer, withoutResponse: boolean): Promise<void>;
    broadcast(broadcast: boolean): Promise<void>;
    notify(notify: boolean): Promise<void>;
    subscribe(): Promise<void>;
    unsubscribe(): Promise<void>;
    discoverDescriptors(): Promise<GattDescriptorRemote[]>;
    getDiscoveredDescriptors(): GattDescriptorRemote[];
}
