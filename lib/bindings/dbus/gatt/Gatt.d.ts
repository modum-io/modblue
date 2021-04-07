import { GattRemote } from '../../../models';
import { DbusPeripheral } from '../Peripheral';
import { DbusGattService } from './Service';
export declare class DbusGatt extends GattRemote {
    readonly peripheral: DbusPeripheral;
    readonly services: Map<string, DbusGattService>;
    private get dbus();
    constructor(peripheral: DbusPeripheral);
    discoverServices(): Promise<DbusGattService[]>;
}
//# sourceMappingURL=Gatt.d.ts.map