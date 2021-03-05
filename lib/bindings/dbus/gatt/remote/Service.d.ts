import { GattServiceRemote } from '../../../../models';
import { DbusGattCharacteristicRemote } from './Characteristic';
import { DbusGattRemote } from './Gatt';
export declare class DbusGattServiceRemote extends GattServiceRemote {
    readonly path: string;
    characteristics: Map<string, DbusGattCharacteristicRemote>;
    constructor(gatt: DbusGattRemote, path: string, uuid: string);
}
//# sourceMappingURL=Service.d.ts.map