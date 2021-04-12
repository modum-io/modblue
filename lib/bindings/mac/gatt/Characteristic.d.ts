/// <reference types="node" />
import { GattCharacteristic, GattDescriptor } from "../../../models";
import { MacGattService } from "./Service";
export declare class MacGattCharacteristic extends GattCharacteristic {
    readonly service: MacGattService;
    discoverDescriptors(): Promise<GattDescriptor[]>;
    read(): Promise<Buffer>;
    write(data: Buffer, withoutResponse: boolean): Promise<void>;
    broadcast(broadcast: boolean): Promise<void>;
    notify(notify: boolean): Promise<void>;
    addDescriptor(uuid: string, value: Buffer): Promise<GattDescriptor>;
}
//# sourceMappingURL=Characteristic.d.ts.map