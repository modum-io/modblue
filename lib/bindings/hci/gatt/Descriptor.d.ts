/// <reference types="node" />
import { GattDescriptor } from '../../../models';
import { HciGattCharacteristic } from './Characteristic';
export declare class HciGattDescriptor extends GattDescriptor {
    readonly characteristic: HciGattCharacteristic;
    handle: number;
    private get service();
    private get gatt();
    constructor(characteristic: HciGattCharacteristic, uuid: string, isRemote: boolean, handle: number, value?: Buffer);
    read(): Promise<Buffer>;
    write(data: Buffer): Promise<void>;
}
//# sourceMappingURL=Descriptor.d.ts.map