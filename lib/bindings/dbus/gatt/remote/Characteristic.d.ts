import { GattCharacteristicProperty, GattCharacteristicRemote } from '../../../../models';
import { BusObject } from '../../misc';
import { DbusGattServiceRemote } from './Service';
export declare class DbusGattCharacteristicRemote extends GattCharacteristicRemote {
    readonly busObject: BusObject;
    constructor(service: DbusGattServiceRemote, uuid: string, properties: GattCharacteristicProperty[], busObject: BusObject);
}
