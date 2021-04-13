import { GattCharacteristic, GattService } from '../../../models';
import { WinGatt } from './Gatt';
export declare class WinGattService extends GattService {
    readonly gatt: WinGatt;
    addCharacteristic(): Promise<GattCharacteristic>;
    discoverCharacteristics(): Promise<GattCharacteristic[]>;
}
//# sourceMappingURL=Service.d.ts.map