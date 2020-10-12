import { GattServiceRemote } from '../../../../models';
import { BusObject } from '../../misc';
import { DbusGattCharacteristicRemote } from './Characteristic';
import { DbusGattRemote } from './Gatt';
export declare class DbusGattServiceRemote extends GattServiceRemote {
    readonly busObject: BusObject;
    characteristics: Map<string, DbusGattCharacteristicRemote>;
    constructor(gatt: DbusGattRemote, uuid: string, busObject: BusObject);
}
