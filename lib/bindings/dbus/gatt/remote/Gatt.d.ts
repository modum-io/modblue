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
    broadcast(): Promise<void>;
    notify(): Promise<void>;
    discoverDescriptors(): Promise<GattDescriptorRemote[]>;
    readValue(): Promise<Buffer>;
    writeValue(): Promise<void>;
}
//# sourceMappingURL=Gatt.d.ts.map