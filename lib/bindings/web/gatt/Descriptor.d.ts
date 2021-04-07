/// <reference types="web-bluetooth" />
/// <reference types="node" />
import { GattDescriptor } from '../../../models';
import { WebGattCharacteristic } from './Characteristic';
export declare class WebGattDescriptor extends GattDescriptor {
    readonly characteristic: WebGattCharacteristic;
    private desc;
    constructor(characteristic: WebGattCharacteristic, descriptor: BluetoothRemoteGATTDescriptor);
    read(): Promise<Buffer>;
    write(data: Buffer): Promise<void>;
}
//# sourceMappingURL=Descriptor.d.ts.map