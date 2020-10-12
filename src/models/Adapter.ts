import { EventEmitter } from 'events';

import { Noble } from './Noble';
import { Peripheral } from './Peripheral';

export declare interface Adapter {
	on(event: 'discover', listener: (peripheral: Peripheral) => void): this;

	emit(event: 'discover', peripheral: Peripheral): boolean;
}

export abstract class Adapter extends EventEmitter {
	public readonly noble: Noble;

	public readonly id: string;

	protected _name: string;
	public get name() {
		return this._name;
	}

	protected _address: string;
	public get address() {
		return this._address;
	}

	public constructor(noble: Noble, id: string, name?: string, address?: string) {
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

	public abstract async getScannedPeripherals(): Promise<Peripheral[]>;

	public abstract async startAdvertising(name: string, serviceUUIDs?: string[]): Promise<void>;
	public abstract async stopAdvertising(): Promise<void>;
}
