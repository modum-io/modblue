import { ConnectOptions, Peripheral } from '../../models';
import { HciAdapter } from './Adapter';
import { HciGattRemote } from './gatt';
import { Hci } from './misc';
export declare class HciPeripheral extends Peripheral {
    adapter: HciAdapter;
    protected _gatt: HciGattRemote;
    private handle;
    private signaling;
    private _isMaster;
    get isMaster(): boolean;
    connect(options?: ConnectOptions): Promise<HciGattRemote>;
    onConnect(isMaster: boolean, hci: Hci, handle: number): void;
    disconnect(): Promise<void>;
    onDisconnect(reason?: string): void;
}
//# sourceMappingURL=Peripheral.d.ts.map