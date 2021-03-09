import { AddressType, GattRemote, Peripheral } from '../../models';
import { DbusAdapter } from './Adapter';
export declare class DbusPeripheral extends Peripheral {
    adapter: DbusAdapter;
    readonly path: string;
    private deviceIface;
    private propsIface;
    private _init;
    private gatt;
    private isConnecting;
    private connecting;
    private connectTimeout;
    private isDisconnecting;
    private disconnecting;
    private disconnectTimeout;
    constructor(adapter: DbusAdapter, path: string, id: string, addressType: AddressType, address: string, advertisement: Record<string, unknown>, rssi: number);
    private init;
    private prop;
    private isConnected;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    private doneConnecting;
    private doneDisconnecting;
    setupGatt(requestMtu?: number): Promise<GattRemote>;
}
//# sourceMappingURL=Peripheral.d.ts.map