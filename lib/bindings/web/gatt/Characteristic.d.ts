/// <reference types="web-bluetooth" />
/// <reference types="node" />
import { GattCharacteristic, GattCharacteristicProperty, GattDescriptor } from '../../../models';
import { WebGattDescriptor } from './Descriptor';
import { WebGattService } from './Service';
export declare class WebGattCharacteristic extends GattCharacteristic {
    readonly service: WebGattService;
    readonly descriptors: Map<string, WebGattDescriptor>;
    private char;
    constructor(service: WebGattService, characteristic: BluetoothRemoteGATTCharacteristic, properties: GattCharacteristicProperty[], secure: GattCharacteristicProperty[]);
    discoverDescriptors(): Promise<GattDescriptor[]>;
    read(): Promise<Buffer>;
    write(data: Buffer, withoutResponse: boolean): Promise<void>;
    broadcast(): Promise<void>;
    notify(notify: boolean): Promise<void>;
    private onValueChanged;
}
//# sourceMappingURL=Characteristic.d.ts.map