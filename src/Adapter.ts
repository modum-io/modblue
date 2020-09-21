import { EventEmitter } from 'events';

import { BaseNoble } from './Noble';
import { BasePeripheral } from './Peripheral';

export declare interface BaseAdapter<N extends BaseNoble = BaseNoble> {
	on(event: 'discover', listener: (peripheral: BasePeripheral) => void): this;

	emit(event: 'discover', peripheral: BasePeripheral): boolean;
}

export abstract class BaseAdapter<N extends BaseNoble = BaseNoble> extends EventEmitter {
	protected readonly noble: N;

	public readonly id: string;
	protected _name: string;
	public get name() {
		return this._name;
	}
	protected _address: string;
	public get address() {
		return this._address;
	}

	public constructor(noble: N, id: string, name?: string, address?: string) {
		super();

		this.noble = noble;
		this.id = id;
		this._name = name || `hci${id.replace('hci', '')}`;
		this._address = address;
	}

	public toString() {
		return JSON.stringify({
			id: this.id,
			name: this.name,
			address: this.address
		});
	}

	public abstract async isScanning(): Promise<boolean>;

	public abstract async startScanning(serviceUUIDs?: string[], allowDuplicates?: boolean): Promise<void>;
	public abstract async stopScanning(): Promise<void>;

	public abstract async getScannedPeripherals(): Promise<BasePeripheral[]>;
}
