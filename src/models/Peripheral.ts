import { AddressType } from '../types';

import { Adapter } from './Adapter';
import { GattRemote } from './gatt';

export type PeripheralState = 'connecting' | 'connected' | 'disconnecting' | 'disconnected';

export abstract class Peripheral {
	public readonly adapter: Adapter;

	public readonly uuid: string;
	public readonly addressType: AddressType;
	public readonly address: string;

	public connectable: boolean;
	public advertisement: any;
	public rssi: number;

	protected _state: PeripheralState;
	public get state() {
		return this._state;
	}

	public constructor(
		adapter: Adapter,
		uuid: string,
		address: string,
		addressType: AddressType,
		connectable?: boolean,
		advertisement?: any,
		rssi?: number
	) {
		this.adapter = adapter;
		this.uuid = uuid;
		this.addressType = addressType;
		this.address = address;

		this.connectable = connectable;
		this.advertisement = advertisement;
		this.rssi = rssi;

		this._state = 'disconnected';
	}

	public toString() {
		return JSON.stringify({
			uuid: this.uuid,
			address: this.address,
			addressType: this.addressType,
			connectable: this.connectable,
			advertisement: this.advertisement,
			rssi: this.rssi,
			state: this._state
		});
	}

	public abstract async connect(): Promise<void>;
	public abstract async disconnect(): Promise<number>;

	public abstract async setupGatt(requestMtu?: number): Promise<GattRemote>;
}
