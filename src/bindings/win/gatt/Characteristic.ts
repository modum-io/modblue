import { GattCharacteristic, GattDescriptor } from '../../../models';
import { WinGattDescriptor } from './Descriptor';

import { WinGattService } from './Service';

export class WinGattCharacteristic extends GattCharacteristic {
	public readonly service: WinGattService;

	public discoverDescriptors(): Promise<GattDescriptor[]> {
		const noble = this.service.gatt.peripheral.adapter.noble;

		this.descriptors.clear();
		noble.discoverDescriptors(this.service.gatt.peripheral.uuid, this.service.uuid, this.uuid);

		return new Promise<GattDescriptor[]>((resolve, reject) => {
			const handler = (dev: string, srv: string, char: string, descUUIDs: string[] | Error) => {
				if (dev === this.service.gatt.peripheral.uuid && srv === this.service.uuid && char === this.uuid) {
					noble.off('descriptorsDiscover', handler);
					if (descUUIDs instanceof Error) {
						reject(descUUIDs);
					} else {
						for (const descUUID of descUUIDs) {
							this.descriptors.set(descUUID, new WinGattDescriptor(this, descUUID, true));
						}
						resolve([...this.descriptors.values()]);
					}
				}
			};
			noble.on('descriptorsDiscover', handler);
		});
	}

	public read(): Promise<Buffer> {
		const noble = this.service.gatt.peripheral.adapter.noble;

		noble.read(this.service.gatt.peripheral.uuid, this.service.uuid, this.uuid);

		return new Promise<Buffer>((resolve, reject) => {
			const handler = (dev: string, srv: string, char: string, data: Buffer | Error, isNotification: boolean) => {
				if (
					dev === this.service.gatt.peripheral.uuid &&
					srv === this.service.uuid &&
					char === this.uuid &&
					!isNotification
				) {
					noble.off('read', handler);
					if (data instanceof Error) {
						reject(data);
					} else {
						resolve(data);
					}
				}
			};
			noble.on('read', handler);
		});
	}

	public write(value: Buffer, withoutResponse?: boolean): Promise<void> {
		const noble = this.service.gatt.peripheral.adapter.noble;

		noble.write(this.service.gatt.peripheral.uuid, this.service.uuid, this.uuid, value, withoutResponse);

		return new Promise<void>((resolve, reject) => {
			const handler = (dev: string, srv: string, char: string, err: Error) => {
				if (dev === this.service.gatt.peripheral.uuid && srv === this.service.uuid && char === this.uuid) {
					noble.off('write', handler);
					if (err instanceof Error) {
						reject(err);
					} else {
						resolve();
					}
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

		return new Promise<void>((resolve, reject) => {
			const handler = (dev: string, srv: string, char: string, err: Error) => {
				if (dev === this.service.gatt.peripheral.uuid && srv === this.service.uuid && char === this.uuid) {
					noble.off('notify', handler);
					if (err instanceof Error) {
						reject(err);
					} else {
						resolve();
					}
				}
			};
			noble.on('notify', handler);
		});
	}

	public addDescriptor(): Promise<GattDescriptor> {
		throw new Error('Method not implemented.');
	}
}
