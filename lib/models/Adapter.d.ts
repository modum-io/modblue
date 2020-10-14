/// <reference types="node" />
import { EventEmitter } from 'events';
import { Noble } from './Noble';
import { Peripheral } from './Peripheral';
export declare interface Adapter {
    on(event: 'discover', listener: (peripheral: Peripheral) => void): this;
    emit(event: 'discover', peripheral: Peripheral): boolean;
}
export declare abstract class Adapter extends EventEmitter {
    readonly noble: Noble;
    readonly id: string;
    protected _name: string;
    get name(): string;
    protected _address: string;
    get address(): string;
    constructor(noble: Noble, id: string, name?: string, address?: string);
    toString(): string;
    abstract isScanning(): Promise<boolean>;
    abstract startScanning(serviceUUIDs?: string[], allowDuplicates?: boolean): Promise<void>;
    abstract stopScanning(): Promise<void>;
    abstract getScannedPeripherals(): Promise<Peripheral[]>;
    abstract startAdvertising(deviceName: string, serviceUUIDs?: string[]): Promise<void>;
    abstract stopAdvertising(): Promise<void>;
}
