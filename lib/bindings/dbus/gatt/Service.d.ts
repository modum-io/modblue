import { GattService } from '../../../models';
import { DbusGattCharacteristic } from './Characteristic';
import { DbusGatt } from './Gatt';
export declare class DbusGattService extends GattService {
    readonly path: string;
    characteristics: Map<string, DbusGattCharacteristic>;
    constructor(gatt: DbusGatt, uuid: string, isRemote: boolean, path: string);
}
//# sourceMappingURL=Service.d.ts.map