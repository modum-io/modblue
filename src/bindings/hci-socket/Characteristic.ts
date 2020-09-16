import { BaseCharacteristic } from '../../Characteristic';

import { Descriptor } from './Descriptor';
import { Gatt, GattDescriptor } from './gatt';
import { Noble } from './Noble';
import { Service } from './Service';

export class Characteristic extends BaseCharacteristic<Noble, Service> {
	private gatt: Gatt;

	private descriptors: Map<string, Descriptor> = new Map();

	public constructor(noble: Noble, service: Service, uuid: string, properties: string[], gatt: Gatt) {
		super(noble, service, uuid, properties);

		this.gatt = gatt;
	}

	public async read(): Promise<Buffer> {
		return new Promise<Buffer>((resolve) => {
			const done = (serviceUUID: string, characteristicUUID: string, data: Buffer) => {
				if (serviceUUID !== this.service.uuid || characteristicUUID !== this.uuid) {
					// This isn't our characteristic, ignore
					return;
				}

				this.gatt.off('read', done);

				resolve(data);
			};

			this.gatt.on('read', done);

			this.gatt.read(this.service.uuid, this.uuid);
		});
	}

	public async write(data: Buffer, withoutResponse: boolean): Promise<void> {
		return new Promise<void>((resolve) => {
			const done = (serviceUUID: string, characteristicUUID: string) => {
				if (serviceUUID !== this.service.uuid || characteristicUUID !== this.uuid) {
					// This isn't our characteristic, ignore
					return;
				}

				this.gatt.off('write', done);

				resolve();
			};

			this.gatt.on('write', done);

			this.gatt.write(this.service.uuid, this.uuid, data, withoutResponse);
		});
	}

	public async broadcast(broadcast: boolean): Promise<boolean> {
		return new Promise<boolean>((resolve) => {
			const done = (serviceUUID: string, characteristicUUID: string, newBroadcast: boolean) => {
				if (serviceUUID !== this.service.uuid || characteristicUUID !== this.uuid) {
					// This isn't our characteristic, ignore
					return;
				}

				this.gatt.off('broadcast', done);

				resolve(newBroadcast);
			};

			this.gatt.on('broadcast', done);

			this.gatt.broadcast(this.service.uuid, this.uuid, broadcast);
		});
	}

	public async notify(notify: boolean): Promise<boolean> {
		return new Promise<boolean>((resolve) => {
			const done = (serviceUUID: string, characteristicUUID: string, newNotify: boolean) => {
				if (serviceUUID !== this.service.uuid || characteristicUUID !== this.uuid) {
					// This isn't our characteristic, ignore
					return;
				}

				this.gatt.off('notify', done);

				resolve(newNotify);
			};

			this.gatt.on('notify', done);

			this.gatt.notify(this.service.uuid, this.uuid, notify);
		});
	}

	public async subscribe(): Promise<void> {
		await this.notify(true);
	}
	public async unsubscribe(): Promise<void> {
		await this.notify(false);
	}

	public async discoverDescriptors(): Promise<Descriptor[]> {
		return new Promise<Descriptor[]>((resolve) => {
			const done = (serviceUUID: string, characteristicUUID: string, descriptors: GattDescriptor[]) => {
				if (serviceUUID !== this.service.uuid || characteristicUUID !== this.uuid) {
					// This isn't our characteristic, ignore
					return;
				}

				this.gatt.off('descriptorsDiscovered', done);

				for (const rawDescriptor of descriptors) {
					let descriptor = this.descriptors.get(rawDescriptor.uuid);
					if (!descriptor) {
						descriptor = new Descriptor(this.noble, this, rawDescriptor.uuid, this.gatt);
						this.descriptors.set(rawDescriptor.uuid, descriptor);
					}
				}

				resolve([...this.descriptors.values()]);
			};

			this.gatt.on('descriptorsDiscovered', done);

			this.gatt.discoverDescriptors(this.service.uuid, this.uuid);
		});
	}
}
