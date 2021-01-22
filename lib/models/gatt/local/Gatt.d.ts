/// <reference types="node" />
import { Adapter } from '../../Adapter';
import { GattCharacteristicProperty } from '../Characteristic';
import { Gatt } from '../Gatt';
import { GattCharacteristicLocal, ReadFunction, WriteFunction } from './Characteristic';
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
    value: number;
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
    secure: GattCharacteristicProperty[];
    value?: Buffer;
    onRead?: ReadFunction;
    onWrite?: WriteFunction;
    descriptors?: GattDescriptorInput[];
}
export interface GattDescriptorInput {
    uuid: string;
    value: Buffer;
}
export declare abstract class GattLocal extends Gatt {
    readonly adapter: Adapter;
    protected handles: Handle[];
    protected _maxMtu: number;
    get maxMtu(): number;
    protected _deviceName: string;
    get deviceName(): string;
    protected _serviceInputs: GattServiceInput[];
    get serviceInputs(): GattServiceInput[];
    constructor(adapter: Adapter, maxMtu?: number);
    setData(deviceName: string, services: GattServiceInput[]): void;
    toJSON(): {
        maxMtu: number;
        adapter: Adapter;
    };
}
export {};
