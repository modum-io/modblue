/// <reference types="node" />
import { GattCharacteristic, GattDescriptor } from '../../../models';
import { MacGattService } from './Service';
export declare class MacGattCharacteristic extends GattCharacteristic {
    readonly service: MacGattService;
    discoverDescriptors(): Promise<GattDescriptor[]>;
    read(): Promise<Buffer>;
    write(value: Buffer): Promise<void>;
    broadcast(): Promise<void>;
    notify(notify: boolean): Promise<void>;
    addDescriptor(): Promise<GattDescriptor>;
}
//# sourceMappingURL=Characteristic.d.ts.map