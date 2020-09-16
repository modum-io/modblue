/// <reference types="node" />
import { BaseCharacteristic } from './Characteristic';
import { BaseNoble } from './Noble';
export declare abstract class BaseDescriptor<N extends BaseNoble = BaseNoble, C extends BaseCharacteristic = BaseCharacteristic> {
    protected readonly noble: N;
    readonly characteristic: C;
    readonly uuid: string;
    constructor(noble: N, characteristic: C, uuid: string);
    toString(): string;
    abstract readValue(): Promise<Buffer>;
    abstract writeValue(data: Buffer): Promise<void>;
}
