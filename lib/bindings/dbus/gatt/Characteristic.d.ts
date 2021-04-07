/// <reference types="node" />
import { GattCharacteristic, GattCharacteristicProperty, GattDescriptor } from '../../../models';
import { DbusGattService } from './Service';
export declare class DbusGattCharacteristic extends GattCharacteristic {
    readonly service: DbusGattService;
    readonly path: string;
    private iface;
    private get dbus();
    constructor(service: DbusGattService, uuid: string, isRemote: boolean, properties: GattCharacteristicProperty[], secure: GattCharacteristicProperty[], path: string);
    discoverDescriptors(): Promise<GattDescriptor[]>;
    read(): Promise<Buffer>;
    write(data: Buffer, withoutResponse: boolean): Promise<void>;
    broadcast(): Promise<void>;
    notify(): Promise<void>;
    private getInterface;
    addDescriptor(): Promise<GattDescriptor>;
}
//# sourceMappingURL=Characteristic.d.ts.map