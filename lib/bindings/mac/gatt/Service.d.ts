/// <reference types="node" />
import { GattCharacteristic, GattCharacteristicProperty, GattService, ReadFunction, WriteFunction } from "../../../models";
import { MacGatt } from "./Gatt";
export declare class MacGattService extends GattService {
    readonly gatt: MacGatt;
    addCharacteristic(uuid: string, props: GattCharacteristicProperty[], secure: GattCharacteristicProperty[], readFuncOrValue?: Buffer | ReadFunction, writeFunc?: WriteFunction): Promise<GattCharacteristic>;
    discoverCharacteristics(): Promise<GattCharacteristic[]>;
}
//# sourceMappingURL=Service.d.ts.map