import { GattServiceRemote } from '../../../../models';
import { HciGattCharacteristicRemote } from './Characteristic';
import { HciGattRemote } from './Gatt';
export declare class HciGattServiceRemote extends GattServiceRemote {
    gatt: HciGattRemote;
    readonly startHandle: number;
    readonly endHandle: number;
    characteristics: Map<string, HciGattCharacteristicRemote>;
    constructor(gatt: HciGattRemote, uuid: string, startHandle: number, endHandle: number);
}
//# sourceMappingURL=Service.d.ts.map