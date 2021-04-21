/// <reference types="node" />
import { GattDescriptor } from '../../../models';
import { MacGattCharacteristic } from './Characteristic';
export declare class MacGattDescriptor extends GattDescriptor {
    readonly characteristic: MacGattCharacteristic;
    read(): Promise<Buffer>;
    write(value: Buffer): Promise<void>;
}
//# sourceMappingURL=Descriptor.d.ts.map