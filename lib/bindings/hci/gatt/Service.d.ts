import { GattServiceRemote } from '../../../models';
import { HciCharacteristic } from './Characteristic';
import { HciGatt } from './Gatt';
export declare class HciService extends GattServiceRemote {
    gatt: HciGatt;
    readonly startHandle: number;
    readonly endHandle: number;
    characteristics: Map<string, HciCharacteristic>;
    constructor(gatt: HciGatt, uuid: string, startHandle: number, endHandle: number);
}
