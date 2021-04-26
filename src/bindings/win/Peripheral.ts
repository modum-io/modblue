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

		await new Promise<void>((res, rej) => {
			const cleanup = () => {
				clearTimeout(timer);
				this.adapter.noble.off('connect', connHandler);
			};
			const resolve = () => {
				cleanup();
				res();
			};
			const reject = (err: Error) => {
				cleanup();
				rej(err);
			};

			const timer = setTimeout(() => reject(new Error('Connecting timed out')), 10000);

			const connHandler = (uuid: string, err: Error) => {
				if (uuid === this.uuid) {
					if (err) {
						reject(err);
					} else {
						resolve();
					}
				}
			};
			this.adapter.noble.on('connect', connHandler);

			this.adapter.noble.connect(this.uuid);
		});

		this._gatt = new WinGatt(this);
		this._state = 'connected';
		return this._gatt;
	}

	public async disconnect(): Promise<void> {
		this._state = 'disconnecting';

		await new Promise<void>((res) => {
			const resolve = () => {
				clearTimeout(timer);
				this.adapter.noble.off('connect', disconnHandler);
				res();
			};

			const timer = setTimeout(resolve, 10000);

			const disconnHandler = (uuid: string) => {
				if (uuid === this.uuid) {
					resolve();
				}
			};
			this.adapter.noble.on('disconnect', disconnHandler);

			this.adapter.noble.disconnect(this.uuid);
		});

		this._state = 'disconnected';
	}
}
