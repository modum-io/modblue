/// <reference types="node" />
import { AddressType, GattRemote, Peripheral } from '../../models';
import { WinAdapter } from './Adapter';
export declare class WinPeripheral extends Peripheral {
    readonly adapter: WinAdapter;
    constructor(adapter: WinAdapter, uuid: string, name: string, addressType: AddressType, address: string, manufacturerData: Buffer, rssi: number);
    connect(): Promise<GattRemote>;
    disconnect(): Promise<void>;
}
//# sourceMappingURL=Peripheral.d.ts.map