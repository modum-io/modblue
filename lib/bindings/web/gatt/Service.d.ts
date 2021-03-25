/// <reference types="web-bluetooth" />
import { GattCharacteristic, GattService } from '../../../models';
import { WebGatt } from './Gatt';
import { WebGattCharacteristic } from './Characteristic';
export declare class WebGattService extends GattService {
    readonly gatt: WebGatt;
    readonly characteristics: Map<string, WebGattCharacteristic>;
    private srv;
    constructor(gatt: WebGatt, service: BluetoothRemoteGATTService);
    discoverCharacteristics(): Promise<GattCharacteristic[]>;
}
//# sourceMappingURL=Service.d.ts.map