/// <reference types="node" />
import { GattCharacteristic, GattCharacteristicProperty, GattDescriptor } from '../../../models';
import { DbusGattService } from './Service';
export declare class DbusGattCharacteristic extends GattCharacteristic {
    readonly service: DbusGattService;
    readonly path: string;
    private iface;
    private propsIface;
    private get dbus();
    constructor(service: DbusGattService, uuid: string, isRemote: boolean, properties: GattCharacteristicProperty[], secure: GattCharacteristicProperty[], path: string);
    discoverDescriptors(): Promise<GattDescriptor[]>;
    read(): Promise<Buffer>;
    write(data: Buffer, withoutResponse: boolean): Promise<void>;
    broadcast(): Promise<void>;
    notify(notify: boolean): Promise<void>;
    private onPropsChanged;
    private getInterface;
    private getPropsInterface;
    addDescriptor(): Promise<GattDescriptor>;
}
//# sourceMappingURL=Characteristic.d.ts.map