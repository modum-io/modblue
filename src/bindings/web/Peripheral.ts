import { Peripheral } from '../../models';

import { WebAdapter } from './Adapter';
import { WebGatt } from './gatt';

export class WebPeripheral extends Peripheral {
	public adapter: WebAdapter;

	private device: BluetoothDevice;
	protected _gatt: WebGatt;

	public constructor(adapter: WebAdapter, id: string, device: BluetoothDevice) {
		super(adapter, id, 'unknown', null, {}, 0);

		this.device = device;
	}

	public async connect(): Promise<WebGatt> {
		const gatt = await this.device.gatt.connect();
		this._gatt = new WebGatt(this, gatt);
		return this._gatt;
	}

	public async disconnect(): Promise<void> {
		this._gatt.disconnect();
	}
}
