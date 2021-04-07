/// <reference types="web-bluetooth" />
import { GattRemote, GattService } from '../../../models';
import { WebPeripheral } from '../Peripheral';
import { WebGattService } from './Service';
export declare class WebGatt extends GattRemote {
    readonly peripheral: WebPeripheral;
    readonly services: Map<string, WebGattService>;
    private gatt;
    constructor(peripheral: WebPeripheral, gatt: BluetoothRemoteGATTServer);
    discoverServices(): Promise<WebGattService[]>;
    addService(): Promise<GattService>;
    prepare(): Promise<void>;
    disconnect(): void;
}
//# sourceMappingURL=Gatt.d.ts.map