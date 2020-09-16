/// <reference types="node" />
import { BaseDescriptor } from '../../Descriptor';
import { Characteristic } from './Characteristic';
import { Gatt } from './gatt';
import { Noble } from './Noble';
export declare class Descriptor extends BaseDescriptor {
    private gatt;
    constructor(noble: Noble, characteristic: Characteristic, uuid: string, gatt: Gatt);
    readValue(): Promise<Buffer>;
    writeValue(data: Buffer): Promise<void>;
}
