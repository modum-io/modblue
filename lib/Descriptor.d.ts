/// <reference types="node" />
import { EventEmitter } from 'events';
import { Noble } from './Noble';
export declare class Descriptor extends EventEmitter {
    private noble;
    private peripheralUUID;
    private serviceUUID;
    private characteristicUUID;
    readonly uuid: string;
    readonly name: string;
    readonly type: string;
    constructor(noble: Noble, peripheralUUID: string, serviceUUID: string, characteristicUUID: string, uuid: string);
    toString(): string;
    readValue(): Promise<Buffer>;
    writeValue(data: Buffer): Promise<void>;
}
