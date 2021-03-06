import { GattRemote, GattService } from '../../../models';
import { WebPeripheral } from '../Peripheral';

import { WebGattService } from './Service';

export class WebGatt extends GattRemote {
	public readonly peripheral: WebPeripheral;
	public readonly services: Map<string, WebGattService> = new Map();

	private gatt: BluetoothRemoteGATTServer;

	public constructor(peripheral: WebPeripheral, gatt: BluetoothRemoteGATTServer) {
		super(peripheral);

		this.gatt = gatt;
	}

	public async discoverServices(): Promise<WebGattService[]> {
		const newServices = await this.gatt.getPrimaryServices();

		this.services.clear();
		for (const service of newServices) {
			this.services.set(service.uuid, new WebGattService(this, service));
		}
		return [...this.services.values()];
	}

	public async addService(): Promise<GattService> {
		throw new Error('Method not implemented.');
	}

	public async prepare(): Promise<void> {
		throw new Error('Method not implemented.');
	}

	public disconnect(): void {
		this.gatt.disconnect();
	}
}
