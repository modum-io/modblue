import { GattCharacteristic, GattService } from '../../../models';
import { MacGatt } from './Gatt';
export declare class MacGattService extends GattService {
    readonly gatt: MacGatt;
    addCharacteristic(): Promise<GattCharacteristic>;
    discoverCharacteristics(): Promise<GattCharacteristic[]>;
}
//# sourceMappingURL=Service.d.ts.map