/// <reference types="node" />
import { EventEmitter } from 'events';
import { BaseNoble } from './Noble';
import { BasePeripheral } from './Peripheral';
import { AddressType } from './types';
export declare interface BaseAdapter<N extends BaseNoble = BaseNoble> {
	on(event: 'discover', listener: (peripheral: BasePeripheral) => void): this;
	emit(event: 'discover', peripheral: BasePeripheral): boolean;
}
export declare abstract class BaseAdapter<N extends BaseNoble = BaseNoble> extends EventEmitter {
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
	abstract getScannedPeripherals(): Promise<BasePeripheral[]>;
}
