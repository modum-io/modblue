/// <reference types="node" />
import { GattCharacteristic, GattCharacteristicProperty, GattDescriptor, ReadFunction, WriteFunction } from '../../../models';
import { HciGattDescriptor } from './Descriptor';
import { HciGattService } from './Service';
export declare class HciGattCharacteristic extends GattCharacteristic {
    readonly service: HciGattService;
    readonly descriptors: Map<string, HciGattDescriptor>;
    startHandle: number;
    valueHandle: number;
    endHandle: number;
    private get gatt();
    constructor(service: HciGattService, uuid: string, isRemote: boolean, propsOrFlag: number | GattCharacteristicProperty[], secureOrFlag: number | GattCharacteristicProperty[], startHandle: number, valueHandle: number, readFuncOrValue?: ReadFunction | Buffer, writeFunc?: WriteFunction);
    addDescriptor(uuid: string, value: Buffer): Promise<GattDescriptor>;
    discoverDescriptors(): Promise<GattDescriptor[]>;
    read(): Promise<Buffer>;
    write(data: Buffer, withoutResponse: boolean): Promise<void>;
    broadcast(broadcast: boolean): Promise<void>;
    notify(notify: boolean): Promise<void>;
}
//# sourceMappingURL=Characteristic.d.ts.map