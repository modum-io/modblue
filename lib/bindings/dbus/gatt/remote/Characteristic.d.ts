import { GattCharacteristicProperty, GattCharacteristicRemote } from '../../../../models';
import { DbusGattServiceRemote } from './Service';
export declare class DbusGattCharacteristicRemote extends GattCharacteristicRemote {
    readonly path: string;
    constructor(service: DbusGattServiceRemote, path: string, uuid: string, properties: GattCharacteristicProperty[], secure: GattCharacteristicProperty[]);
}
