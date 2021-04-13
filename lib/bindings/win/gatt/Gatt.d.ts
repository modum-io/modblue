import { GattRemote, GattService } from '../../../models';
import { WinPeripheral } from '../Peripheral';
export declare class WinGatt extends GattRemote {
    readonly peripheral: WinPeripheral;
    discoverServices(): Promise<GattService[]>;
}
//# sourceMappingURL=Gatt.d.ts.map