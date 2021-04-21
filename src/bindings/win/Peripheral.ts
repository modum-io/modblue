import { AddressType, GattRemote, Peripheral } from '../../models';

import { WinAdapter } from './Adapter';
import { WinGatt } from './gatt';

export class WinPeripheral extends Peripheral {
	public readonly adapter: WinAdapter;

	public constructor(
		adapter: WinAdapter,
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

		await new Promise<void>((resolve, reject) => {
			const connHandler = (uuid: string, err: Error) => {
				if (uuid === this.uuid) {
					this.adapter.noble.off('connect', connHandler);
					if (err) {
						reject(err);
					} else {
						resolve();
					}
				}
			};
			this.adapter.noble.on('connect', connHandler);
		});

		this._gatt = new WinGatt(this);
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
