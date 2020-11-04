/// <reference types="node" />
import { GattCharacteristicRemote, GattDescriptorRemote, GattRemote } from '../../../../models';
import { DbusPeripheral } from '../../Peripheral';
import { DbusGattServiceRemote } from './Service';
export declare class DbusGattRemote extends GattRemote {
    peripheral: DbusPeripheral;
    services: Map<string, DbusGattServiceRemote>;
    constructor(peripheral: DbusPeripheral);
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
