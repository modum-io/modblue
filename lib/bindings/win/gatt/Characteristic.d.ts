/// <reference types="node" />
import { GattCharacteristic, GattDescriptor } from '../../../models';
import { WinGattService } from './Service';
export declare class WinGattCharacteristic extends GattCharacteristic {
    readonly service: WinGattService;
    discoverDescriptors(): Promise<GattDescriptor[]>;
    read(): Promise<Buffer>;
    write(value: Buffer, withoutResponse?: boolean): Promise<void>;
    broadcast(): Promise<void>;
    notify(notify: boolean): Promise<void>;
    addDescriptor(): Promise<GattDescriptor>;
}
//# sourceMappingURL=Characteristic.d.ts.map