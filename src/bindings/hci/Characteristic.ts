import { BaseCharacteristic } from '../../Characteristic';

import { Descriptor } from './Descriptor';
import { Gatt } from './gatt';
import { Noble } from './Noble';
import { Service } from './Service';

export class Characteristic extends BaseCharacteristic<Noble, Service> {
	private gatt: Gatt;

	private descriptors: Map<string, Descriptor> = new Map();
	public getDiscoveredDescriptors() {
		return [...this.descriptors.values()];
	}

	public constructor(noble: Noble, service: Service, uuid: string, properties: string[], gatt: Gatt) {
		super(noble, service, uuid, properties);

		this.gatt = gatt;
	}

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

	public async discoverDescriptors(uuids?: string[]): Promise<Descriptor[]> {
		const descriptors = await this.gatt.discoverDescriptors(this.service.uuid, this.uuid, uuids || []);
		for (const rawDescriptor of descriptors) {
			let descriptor = this.descriptors.get(rawDescriptor.uuid);
			if (!descriptor) {
				descriptor = new Descriptor(this.noble, this, rawDescriptor.uuid, this.gatt);
				this.descriptors.set(rawDescriptor.uuid, descriptor);
			}
		}
		return [...this.descriptors.values()];
	}
}
