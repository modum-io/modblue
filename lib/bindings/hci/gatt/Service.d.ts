import { GattService } from '../../../models';
import { HciGattCharacteristic } from './Characteristic';
import { HciGattRemote } from './GattRemote';
export declare class HciGattService extends GattService {
    readonly startHandle: number;
    readonly endHandle: number;
    characteristics: Map<string, HciGattCharacteristic>;
    constructor(gatt: HciGattRemote, uuid: string, isRemote: boolean, startHandle: number, endHandle: number);
}
//# sourceMappingURL=Service.d.ts.map