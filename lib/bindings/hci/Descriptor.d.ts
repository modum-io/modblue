/// <reference types="node" />
import { Descriptor } from '../../Descriptor';
import { HciCharacteristic } from './Characteristic';
import { Gatt } from './gatt';
import { HciNoble } from './Noble';
export declare class HciDescriptor extends Descriptor {
    private gatt;
    constructor(noble: HciNoble, characteristic: HciCharacteristic, uuid: string, gatt: Gatt);
    readValue(): Promise<Buffer>;
    writeValue(data: Buffer): Promise<void>;
}
