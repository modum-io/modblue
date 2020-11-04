/// <reference types="node" />
import { Characteristic } from './Characteristic';
import { Noble } from './Noble';
export declare abstract class Descriptor<N extends Noble = Noble, C extends Characteristic = Characteristic> {
    protected readonly noble: N;
    readonly characteristic: C;
    readonly uuid: string;
    constructor(noble: N, characteristic: C, uuid: string);
    toString(): string;
    abstract readValue(): Promise<Buffer>;
    abstract writeValue(data: Buffer): Promise<void>;
}
