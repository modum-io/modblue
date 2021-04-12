import { Peripheral } from '../../models';

import { WebAdapter } from './Adapter';
import { WebGatt } from './gatt';

export class WebPeripheral extends Peripheral {
	public adapter: WebAdapter;

	private device: BluetoothDevice;
	protected _gatt: WebGatt;

	public constructor(adapter: WebAdapter, device: BluetoothDevice) {
		super(adapter, device.id, device.name, 'unknown', null, null, 0);

		this.device = device;
	}

	public async connect(): Promise<WebGatt> {
		if (this._state === 'connected') {
			return;
		}

		this._state = 'connecting';

		const gatt = await this.device.gatt.connect();
		this._gatt = new WebGatt(this, gatt);

		this._state = 'connected';

		return this._gatt;
	}

	public async disconnect(): Promise<void> {
		if (this._state === 'disconnected') {
			return;
		}

		this._state = 'disconnecting';

		if (this._gatt) {
			this._gatt.disconnect();
			this._gatt = null;
		}

		this._state = 'disconnected';
	}
}
