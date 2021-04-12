import { GattRemote, GattService } from "../../../models";
import { MacPeripheral } from "../Peripheral";
export declare class MacGatt extends GattRemote {
    readonly peripheral: MacPeripheral;
    discoverServices(): Promise<GattService[]>;
}
//# sourceMappingURL=Gatt.d.ts.map