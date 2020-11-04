import { Peripheral } from '../../models';
import { HciAdapter } from './Adapter';
import { HciGattRemote } from './gatt';
import { Hci } from './misc';
export declare class HciPeripheral extends Peripheral {
    adapter: HciAdapter;
    private hci;
    private gatt;
    private mtuExchanged;
    private handle;
    private signaling;
    connect(): Promise<void>;
    onConnect(hci: Hci, handle: number): Promise<void>;
    disconnect(): Promise<void>;
    onDisconnect(): Promise<void>;
    setupGatt(requestMtu?: number): Promise<HciGattRemote>;
}
