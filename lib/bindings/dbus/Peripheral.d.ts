import { AddressType, Peripheral } from '../../models';
import { DbusAdapter } from './Adapter';
import { DbusGatt } from './gatt';
export declare class DbusPeripheral extends Peripheral {
    adapter: DbusAdapter;
    readonly path: string;
    private deviceIface;
    private propsIface;
    private _init;
    protected _gatt: DbusGatt;
    private connecting;
    private connectTimeout;
    private disconnecting;
    private disconnectTimeout;
    constructor(adapter: DbusAdapter, path: string, id: string, addressType: AddressType, address: string, advertisement: Record<string, unknown>, rssi: number);
    private init;
    private prop;
    connect(): Promise<DbusGatt>;
    disconnect(): Promise<void>;
    private doneConnecting;
    private doneDisconnecting;
}
//# sourceMappingURL=Peripheral.d.ts.map