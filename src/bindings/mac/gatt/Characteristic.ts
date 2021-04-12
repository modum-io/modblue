import { GattCharacteristic, GattDescriptor } from '../../../models';
import { MacGattDescriptor } from './Descriptor';

import { MacGattService } from './Service';

export class MacGattCharacteristic extends GattCharacteristic {
	public readonly service: MacGattService;

	public discoverDescriptors(): Promise<GattDescriptor[]> {
		const noble = this.service.gatt.peripheral.adapter.noble;

		this.descriptors.clear();
		noble.discoverDescriptors(this.service.gatt.peripheral.uuid, this.service.uuid, this.uuid);

		return new Promise<GattDescriptor[]>((resolve) => {
			const handler = (dev: string, srv: string, char: string, descUUIDs: string[]) => {
				if (dev === this.service.gatt.peripheral.uuid && srv === this.service.uuid && char === this.uuid) {
					noble.off('descriptorsDiscover', handler);
					for (const descUUID of descUUIDs) {
						this.descriptors.set(descUUID, new MacGattDescriptor(this, descUUID, true));
					}
					resolve([...this.descriptors.values()]);
				}
			};
			noble.on('descriptorsDiscover', handler);
		});
	}

	public read(): Promise<Buffer> {
		const noble = this.service.gatt.peripheral.adapter.noble;

		noble.read(this.service.gatt.peripheral.uuid, this.service.uuid, this.uuid);

		return new Promise<Buffer>((resolve) => {
			const handler = (dev: string, srv: string, char: string, data: Buffer, isNotification: boolean) => {
				if (
					dev === this.service.gatt.peripheral.uuid &&
					srv === this.service.uuid &&
					char === this.uuid &&
					isNotification
				) {
					noble.off('read', handler);
					resolve(data);
				}
			};
			noble.on('read', handler);
		});
	}

	public write(value: Buffer): Promise<void> {
		const noble = this.service.gatt.peripheral.adapter.noble;

		noble.write(this.service.gatt.peripheral.uuid, this.service.uuid, this.uuid, value);

		return new Promise<void>((resolve) => {
			const handler = (dev: string, srv: string, char: string) => {
				if (dev === this.service.gatt.peripheral.uuid && srv === this.service.uuid && char === this.uuid) {
					noble.off('write', handler);
					resolve();
				}
			};
			noble.on('write', handler);
		});
	}

	public broadcast(): Promise<void> {
		throw new Error('Method not implemented.');
	}

	public notify(notify: boolean): Promise<void> {
		const noble = this.service.gatt.peripheral.adapter.noble;

		noble.notify(this.service.gatt.peripheral.uuid, this.service.uuid, this.uuid, notify);

		return new Promise<void>((resolve) => {
			const handler = (dev: string, srv: string, char: string) => {
				if (dev === this.service.gatt.peripheral.uuid && srv === this.service.uuid && char === this.uuid) {
					noble.off('notify', handler);
					resolve();
				}
			};
			noble.on('notify', handler);
		});
	}

	public addDescriptor(): Promise<GattDescriptor> {
		throw new Error('Method not implemented.');
	}
}
