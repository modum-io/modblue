import { GattCharacteristic, GattService } from '../../../models';
import { DbusGattCharacteristic } from './Characteristic';
import { DbusGatt } from './Gatt';
export declare class DbusGattService extends GattService {
    readonly gatt: DbusGatt;
    readonly characteristics: Map<string, DbusGattCharacteristic>;
    readonly path: string;
    private get dbus();
    constructor(gatt: DbusGatt, uuid: string, isRemote: boolean, path: string);
    discoverCharacteristics(): Promise<GattCharacteristic[]>;
}
//# sourceMappingURL=Service.d.ts.map