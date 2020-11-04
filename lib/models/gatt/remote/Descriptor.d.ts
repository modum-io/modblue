/// <reference types="node" />
import { GattDescriptor } from '../Descriptor';
import { GattCharacteristicRemote } from './Characteristic';
export declare class GattDescriptorRemote extends GattDescriptor {
    readonly characteristic: GattCharacteristicRemote;
    protected get gatt(): import("./Gatt").GattRemote;
    readValue(): Promise<Buffer>;
    writeValue(data: Buffer): Promise<void>;
}
