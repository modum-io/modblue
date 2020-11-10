/// <reference types="node" />
import { EventEmitter } from 'events';
import { GattLocal } from './gatt';
import { Noble } from './Noble';
import { Peripheral } from './Peripheral';
export declare interface Adapter {
    on(event: 'discover', listener: (peripheral: Peripheral) => void): this;
    on(event: 'connect', listener: (peripheral: Peripheral) => void): this;
    on(event: 'disconnect', listener: (peripheral: Peripheral) => void): this;
    emit(event: 'discover', peripheral: Peripheral): boolean;
    emit(event: 'connect', peripheral: Peripheral): boolean;
    emit(event: 'disconnect', peripheral: Peripheral, reason: number): boolean;
    isScanning(): Promise<boolean>;
    startScanning(serviceUUIDs?: string[], allowDuplicates?: boolean): Promise<void>;
    stopScanning(): Promise<void>;
    getScannedPeripherals(): Promise<Peripheral[]>;
    startAdvertising(deviceName: string, serviceUUIDs?: string[]): Promise<void>;
    stopAdvertising(): Promise<void>;
    setupGatt(maxMtu?: number): Promise<GattLocal>;
}
export declare abstract class Adapter extends EventEmitter {
    readonly noble: Noble;
    readonly id: string;
    protected _name: string;
    get name(): string;
    protected _addressType: string;
    get addressType(): string;
    protected _address: string;
    get address(): string;
    constructor(noble: Noble, id: string, name?: string, address?: string);
    toString(): string;
}
