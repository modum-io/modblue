/// <reference types="node" />
import { Gatt, GattCharacteristic, GattDescriptor } from '../../../models';
import { DbusPeripheral } from '../Peripheral';
import { DbusGattService } from './Service';
export declare class DbusGatt extends Gatt {
    peripheral: DbusPeripheral;
    services: Map<string, DbusGattService>;
    constructor(peripheral: DbusPeripheral);
    protected doDiscoverServices(): Promise<DbusGattService[]>;
    discoverCharacteristics(serviceUUID: string): Promise<GattCharacteristic[]>;
    readCharacteristic(serviceUUID: string, characteristicUUID: string): Promise<Buffer>;
    writeCharacteristic(serviceUUID: string, characteristicUUID: string, data: Buffer, withoutResponse: boolean): Promise<void>;
    broadcastCharacteristic(): Promise<void>;
    notifyCharacteristic(): Promise<void>;
    discoverDescriptors(): Promise<GattDescriptor[]>;
    readDescriptor(): Promise<Buffer>;
    writeDescriptor(): Promise<void>;
}
//# sourceMappingURL=Gatt.d.ts.map