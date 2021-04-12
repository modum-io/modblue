/// <reference types="node" />
import { AddressType, ConnectOptions, GattRemote, Peripheral } from "../../models";
import { MacAdapter } from "./Adapter";
export declare class MacPeripheral extends Peripheral {
    readonly adapter: MacAdapter;
    constructor(adapter: MacAdapter, uuid: string, name: string, addressType: AddressType, address: string, manufacturerData: Buffer, rssi: number);
    connect(options?: ConnectOptions): Promise<GattRemote>;
    disconnect(): Promise<void>;
}
//# sourceMappingURL=Peripheral.d.ts.map