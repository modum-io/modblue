import { AddressType, GattRemote, Peripheral } from '../../models';

import { MacAdapter } from './Adapter';
import { MacGatt } from './gatt';

export class MacPeripheral extends Peripheral {
	public readonly adapter: MacAdapter;

	public constructor(
		adapter: MacAdapter,
		uuid: string,
		name: string,
		addressType: AddressType,
		address: string,
		manufacturerData: Buffer,
		rssi: number
	) {
		super(adapter, uuid, name, addressType, address, manufacturerData, rssi);
	}

	public async connect(): Promise<GattRemote> {
		this._state = 'connecting';

		this.adapter.noble.connect(this.uuid);

		await new Promise<void>((resolve) => {
			const connHandler = (uuid: string) => {
				if (uuid === this.uuid) {
					this.adapter.noble.off('connect', connHandler);
					resolve();
				}
			};
			this.adapter.noble.on('connect', connHandler);
		});

		this._gatt = new MacGatt(this);
		this._state = 'connected';
		return this._gatt;
	}

	public async disconnect(): Promise<void> {
		this._state = 'disconnecting';

		this.adapter.noble.disconnect(this.uuid);

		await new Promise<void>((resolve) => {
			const disconnHandler = (uuid: string) => {
				if (uuid === this.uuid) {
					this.adapter.noble.off('disconnect', disconnHandler);
					resolve();
				}
			};
			this.adapter.noble.on('disconnect', disconnHandler);
		});

		this._state = 'disconnected';
	}
}
