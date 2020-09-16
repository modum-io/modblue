/// <reference types="node" />
import { EventEmitter } from 'events';
import { BaseNoble } from './Noble';
import { BasePeripheral } from './Peripheral';
export declare interface BaseAdapter<N extends BaseNoble = BaseNoble> {
    on(event: 'discover', listener: (peripheral: BasePeripheral) => void): this;
    emit(event: 'discover', peripheral: BasePeripheral): boolean;
}
export declare abstract class BaseAdapter<N extends BaseNoble = BaseNoble> extends EventEmitter {
    protected readonly noble: N;
    readonly id: string;
    readonly name: string;
    protected _address: string;
    get address(): string;
    constructor(noble: N, id: string, name: string, address: string);
    toString(): string;
    abstract isPowered(): Promise<boolean>;
    abstract isScanning(): Promise<boolean>;
    abstract startScanning(serviceUUIDs?: string[], allowDuplicates?: boolean): Promise<void>;
    abstract stopScanning(): Promise<void>;
    abstract getScannedPeripherals(): Promise<BasePeripheral[]>;
}
