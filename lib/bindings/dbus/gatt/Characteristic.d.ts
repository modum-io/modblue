import { GattCharacteristic, GattCharacteristicProperty } from '../../../models';
import { DbusGattService } from './Service';
export declare class DbusGattCharacteristic extends GattCharacteristic {
    readonly path: string;
    constructor(service: DbusGattService, uuid: string, isRemote: boolean, properties: GattCharacteristicProperty[], secure: GattCharacteristicProperty[], path: string);
}
//# sourceMappingURL=Characteristic.d.ts.map