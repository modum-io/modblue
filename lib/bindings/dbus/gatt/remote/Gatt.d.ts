/// <reference types="node" />
import { GattCharacteristicRemote, GattDescriptorRemote, GattRemote, Peripheral } from '../../../../models';
import { BusObject } from '../../misc';
import { DbusGattServiceRemote } from './Service';
export declare class DbusGattRemote extends GattRemote {
    busObject: BusObject;
    services: Map<string, DbusGattServiceRemote>;
    constructor(peripheral: Peripheral, busObject: BusObject);
    private prop;
    protected doDiscoverServices(): Promise<DbusGattServiceRemote[]>;
    discoverCharacteristics(serviceUUID: string): Promise<GattCharacteristicRemote[]>;
    read(serviceUUID: string, characteristicUUID: string): Promise<Buffer>;
    write(serviceUUID: string, characteristicUUID: string, data: Buffer, withoutResponse: boolean): Promise<void>;
    broadcast(serviceUUID: string, characteristicUUID: string, broadcast: boolean): Promise<void>;
    notify(serviceUUID: string, characteristicUUID: string, notify: boolean): Promise<void>;
    discoverDescriptors(serviceUUID: string, characteristicUUID: string): Promise<GattDescriptorRemote[]>;
    readValue(serviceUUID: string, characteristicUUID: string, descriptorUUID: string): Promise<Buffer>;
    writeValue(serviceUUID: string, characteristicUUID: string, descriptorUUID: string, data: Buffer): Promise<void>;
}
