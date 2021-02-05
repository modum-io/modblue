import { GattRemote, Peripheral } from '../../models';
import { HciAdapter } from './Adapter';
import { Hci } from './misc';
export declare class HciPeripheral extends Peripheral {
    adapter: HciAdapter;
    private hci;
    private gatt;
    private mtuExchanged;
    private handle;
    private signaling;
    private _isMaster;
    get isMaster(): boolean;
    connect(): Promise<void>;
    onConnect(isMaster: boolean, hci: Hci, handle: number): void;
    disconnect(): Promise<void>;
    onDisconnect(): void;
    setupGatt(requestMtu?: number): Promise<GattRemote>;
}
