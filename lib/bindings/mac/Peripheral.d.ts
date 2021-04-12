/// <reference types="node" />
import { AddressType, GattRemote, Peripheral } from '../../models';
import { MacAdapter } from './Adapter';
export declare class MacPeripheral extends Peripheral {
    readonly adapter: MacAdapter;
    constructor(adapter: MacAdapter, uuid: string, name: string, addressType: AddressType, address: string, manufacturerData: Buffer, rssi: number);
    connect(): Promise<GattRemote>;
    disconnect(): Promise<void>;
}
//# sourceMappingURL=Peripheral.d.ts.map