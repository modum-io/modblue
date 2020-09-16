import { BaseAdapter } from './Adapter';

export abstract class BaseNoble {
	protected _state: string = 'unknown';
	public get state() {
		return this._state;
	}

	protected _address: string = 'unknown';
	public get address() {
		return this._address;
	}

	public abstract async init(): Promise<void>;
	public abstract async dispose(): Promise<void>;

	public abstract async getAdapters(): Promise<BaseAdapter[]>;
}
