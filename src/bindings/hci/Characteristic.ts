import { Characteristic } from '../../Characteristic';
import { Descriptor } from '../../Descriptor';

import { HciDescriptor } from './Descriptor';
import { Gatt } from './gatt';
import { HciNoble } from './Noble';
import { HciService } from './Service';

export class HciCharacteristic extends Characteristic<HciNoble, HciService> {
	private gatt: Gatt;

	private descriptors: Map<string, Descriptor> = new Map();

	public constructor(noble: HciNoble, service: HciService, uuid: string, properties: string[], gatt: Gatt) {
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

	public getDiscoveredDescriptors(): Descriptor[] {
		return [...this.descriptors.values()];
	}

	public async discoverDescriptors(uuids?: string[]): Promise<Descriptor[]> {
		const descriptors = await this.gatt.discoverDescriptors(this.service.uuid, this.uuid, uuids || []);
		for (const rawDescriptor of descriptors) {
			let descriptor = this.descriptors.get(rawDescriptor.uuid);
			if (!descriptor) {
				descriptor = new HciDescriptor(this.noble, this, rawDescriptor.uuid, this.gatt);
				this.descriptors.set(rawDescriptor.uuid, descriptor);
			}
		}
		return [...this.descriptors.values()];
	}
}
