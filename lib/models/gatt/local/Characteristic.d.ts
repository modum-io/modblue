/// <reference types="node" />
import { GattCharacteristic, GattCharacteristicProperty } from '../Characteristic';
import { GattDescriptorLocal } from './Descriptor';
import { GattServiceLocal } from './Service';
export declare type ReadFunction = (offset: number) => Promise<[number, Buffer]>;
export declare type WriteFunction = (offset: number, data: Buffer, withoutResponse: boolean) => Promise<number>;
export declare class GattCharacteristicLocal extends GattCharacteristic {
    readonly service: GattServiceLocal;
    readonly descriptors: GattDescriptorLocal[];
    private readonly readFunc;
    private readonly writeFunc;
    constructor(service: GattServiceLocal, uuid: string, properties: GattCharacteristicProperty[], secure: GattCharacteristicProperty[], readFunc: ReadFunction, writeFunc: WriteFunction, descriptors: GattDescriptorLocal[]);
    readRequest(offset: number): Promise<[number, Buffer]>;
    writeRequest(offset: number, data: Buffer, withoutResponse: boolean): Promise<number>;
}
