/// <reference types="node" />
import { GattDescriptor } from '../Descriptor';
import { GattCharacteristicLocal } from './Characteristic';
export declare class GattDescriptorLocal extends GattDescriptor {
    readonly characteristic: GattCharacteristicLocal;
    value: Buffer;
    constructor(characteristic: GattCharacteristicLocal, uuid: string, value: Buffer);
}
