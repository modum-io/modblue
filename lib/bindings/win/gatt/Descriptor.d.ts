/// <reference types="node" />
import { GattDescriptor } from '../../../models';
import { WinGattCharacteristic } from './Characteristic';
export declare class WinGattDescriptor extends GattDescriptor {
    readonly characteristic: WinGattCharacteristic;
    read(): Promise<Buffer>;
    write(value: Buffer): Promise<void>;
}
//# sourceMappingURL=Descriptor.d.ts.map