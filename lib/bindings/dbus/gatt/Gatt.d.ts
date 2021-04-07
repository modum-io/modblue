import { Gatt, GattService } from '../../../models';
import { DbusPeripheral } from '../Peripheral';
import { DbusGattService } from './Service';
export declare class DbusGatt extends Gatt {
    readonly peripheral: DbusPeripheral;
    readonly services: Map<string, DbusGattService>;
    private get dbus();
    constructor(peripheral: DbusPeripheral);
    discoverServices(): Promise<DbusGattService[]>;
    addService(): Promise<GattService>;
    prepare(): Promise<void>;
}
//# sourceMappingURL=Gatt.d.ts.map