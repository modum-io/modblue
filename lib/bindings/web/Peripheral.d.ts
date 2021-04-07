/// <reference types="web-bluetooth" />
import { Peripheral } from '../../models';
import { WebAdapter } from './Adapter';
import { WebGatt } from './gatt';
export declare class WebPeripheral extends Peripheral {
    adapter: WebAdapter;
    private device;
    protected _gatt: WebGatt;
    constructor(adapter: WebAdapter, device: BluetoothDevice);
    connect(): Promise<WebGatt>;
    disconnect(): Promise<void>;
}
//# sourceMappingURL=Peripheral.d.ts.map