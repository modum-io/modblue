import { GattCharacteristic } from '../Characteristic';

import { GattDescriptorRemote } from './Descriptor';
import { GattServiceRemote } from './Service';

export class GattCharacteristicRemote extends GattCharacteristic {
	public readonly service: GattServiceRemote;
	protected get gatt() {
		return this.service.gatt;
	}

	public readonly descriptors: Map<string, GattDescriptorRemote> = new Map();

	public async read(): Promise<Buffer> {
		return this.gatt.read(this.service.uuid, this.uuid);
	}
	public async write(data: Buffer, withoutResponse: boolean): Promise<void> {
		await this.gatt.write(this.service.uuid, this.uuid, data, withoutResponse);
	}
	public async broadcast(broadcast: boolean): Promise<void> {
		await this.gatt.broadcast(this.service.uuid, this.uuid, broadcast);
	}

	public async notify(notify: boolean): Promise<void> {
		await this.gatt.notify(this.service.uuid, this.uuid, notify);
	}
	public async subscribe(): Promise<void> {
		await this.notify(true);
	}
	public async unsubscribe(): Promise<void> {
		await this.notify(false);
	}

	public async discoverDescriptors(): Promise<GattDescriptorRemote[]> {
		const descriptors = await this.gatt.discoverDescriptors(this.service.uuid, this.uuid);
		for (const descriptor of descriptors) {
			this.descriptors.set(descriptor.uuid, descriptor);
		}
		return [...this.descriptors.values()];
	}
	public getDiscoveredDescriptors(): GattDescriptorRemote[] {
		return [...this.descriptors.values()];
	}
}
