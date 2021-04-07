/// <reference types="node" />
import { GattCharacteristic, GattCharacteristicProperty, GattService, ReadFunction, WriteFunction } from '../../../models';
import { HciGattCharacteristic } from './Characteristic';
import { HciGattLocal } from './GattLocal';
import { HciGattRemote } from './GattRemote';
export declare class HciGattService extends GattService {
    readonly gatt: HciGattRemote | HciGattLocal;
    readonly characteristics: Map<string, HciGattCharacteristic>;
    startHandle: number;
    endHandle: number;
    constructor(gatt: HciGattRemote | HciGattLocal, uuid: string, isRemote: boolean, startHandle: number, endHandle: number);
    addCharacteristic(uuid: string, props: GattCharacteristicProperty[], secure: GattCharacteristicProperty[], readFuncOrValue?: ReadFunction | Buffer, writeFunc?: WriteFunction): Promise<GattCharacteristic>;
    discoverCharacteristics(): Promise<GattCharacteristic[]>;
}
//# sourceMappingURL=Service.d.ts.map