import { BaseAdapter } from './Adapter';
import { BaseNoble } from './Noble';
import { BaseService } from './Service';
import { AddressType, PeripheralState } from './types';

export abstract class BasePeripheral<N extends BaseNoble = BaseNoble, A extends BaseAdapter = BaseAdapter> {
	protected readonly noble: N;

	public readonly adapter: A;

	public readonly uuid: string;
	public readonly address: string;
	public readonly addressType: AddressType;

	public connectable: boolean;
	public advertisement: any;
	public rssi: number;

	protected _state: PeripheralState;
	public get state() {
		return this._state;
	}
	protected _mtu: number;
	public get mtu() {
		return this._mtu;
	}

	public constructor(
		noble: N,
		adapter: A,
		uuid: string,
		address: string,
		addressType: AddressType,
		connectable: boolean,
		advertisement: any,
		rssi: number
	) {
		this.noble = noble;

		this.adapter = adapter;
		this.uuid = uuid;
		this.address = address;
		this.addressType = addressType;

		this.connectable = connectable;
		this.advertisement = advertisement;
		this.rssi = rssi;

		this._state = 'disconnected';
		this._mtu = null;
	}

	public toString() {
		return JSON.stringify({
			uuid: this.uuid,
			address: this.address,
			addressType: this.addressType,
			connectable: this.connectable,
			advertisement: this.advertisement,
			rssi: this.rssi,
			state: this._state,
			mtu: this._mtu
		});
	}

	public abstract async connect(requestMtu?: number): Promise<void>;

	public abstract async disconnect(): Promise<number>;

	public abstract getDiscoveredServices(): BaseService[];

	public abstract async discoverServices(serviceUUIDs: string[]): Promise<BaseService[]>;
}
