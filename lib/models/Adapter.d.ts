/// <reference types="node" />
import { EventEmitter } from 'events';
import { AddressType } from '../types';
import { Noble } from './Noble';
import { Peripheral } from './Peripheral';
export declare interface Adapter<N extends Noble = Noble> {
    on(event: 'discover', listener: (peripheral: Peripheral) => void): this;
    emit(event: 'discover', peripheral: Peripheral): boolean;
}
export declare abstract class Adapter<N extends Noble = Noble> extends EventEmitter {
    protected readonly noble: N;
    readonly id: string;
    protected _name: string;
    get name(): string;
    protected _addressType: AddressType;
    get addressType(): AddressType;
    protected _address: string;
    get address(): string;
    constructor(noble: N, id: string, name?: string, address?: string);
    toString(): string;
    abstract isScanning(): Promise<boolean>;
    abstract startScanning(serviceUUIDs?: string[], allowDuplicates?: boolean): Promise<void>;
    abstract stopScanning(): Promise<void>;
    abstract getScannedPeripherals(): Promise<Peripheral[]>;
}
