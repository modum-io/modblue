import { GattService } from '../Service';
import { GattCharacteristicLocal } from './Characteristic';
import { GattLocal } from './Gatt';
export declare class GattServiceLocal extends GattService {
    readonly gatt: GattLocal;
    readonly characteristics: GattCharacteristicLocal[];
    constructor(gatt: GattLocal, uuid: string, characteristics: GattCharacteristicLocal[]);
}
