/// <reference types="web-bluetooth" />
import { Gatt } from '../../../models';
import { WebPeripheral } from '../Peripheral';
import { WebGattService } from './Service';
export declare class WebGatt extends Gatt {
    readonly peripheral: WebPeripheral;
    readonly services: Map<string, WebGattService>;
    private gatt;
    constructor(peripheral: WebPeripheral, gatt: BluetoothRemoteGATTServer);
    discoverServices(): Promise<WebGattService[]>;
    disconnect(): void;
}
//# sourceMappingURL=Gatt.d.ts.map