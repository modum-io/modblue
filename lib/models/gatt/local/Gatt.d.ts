/// <reference types="node" />
import { Adapter } from '../../Adapter';
import { GattCharacteristicProperty } from '../Characteristic';
import { Gatt } from '../Gatt';
import { GattCharacteristicLocal } from './Characteristic';
import { GattDescriptorLocal } from './Descriptor';
import { GattServiceLocal } from './Service';
interface ServiceHandle {
    type: 'service';
    start: number;
    end: number;
    object: GattServiceLocal;
}
interface CharacteristicHandle {
    type: 'characteristic' | 'characteristicValue';
    start: number;
    object: GattCharacteristicLocal;
}
interface DescriptorHandle {
    type: 'descriptor';
    value: number;
    object: GattDescriptorLocal;
}
declare type Handle = ServiceHandle | CharacteristicHandle | DescriptorHandle;
export interface GattServiceInput {
    uuid: string;
    characteristics: GattCharacteristicInput[];
}
export interface GattCharacteristicInput {
    uuid: string;
    properties: GattCharacteristicProperty[];
    value?: Buffer;
    descriptors?: GattDescriptorInput[];
}
export interface GattDescriptorInput {
    uuid: string;
    value: Buffer;
}
export declare abstract class GattLocal extends Gatt {
    readonly adapter: Adapter;
    protected handles: Map<number, Handle>;
    constructor(adapter: Adapter);
    toString(): string;
    setData(deviceName: string, services: GattServiceInput[]): void;
}
export {};
