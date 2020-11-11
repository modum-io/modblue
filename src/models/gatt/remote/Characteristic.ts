import { GattCharacteristic } from '../Characteristic';

import { GattDescriptorRemote } from './Descriptor';
import { GattServiceRemote } from './Service';

/**
 * Represents a characteristic connected to a remote GATT service.
 */
export class GattCharacteristicRemote extends GattCharacteristic {
	/**
	 * The service that this characteristic belongs to.
	 */
	public readonly service: GattServiceRemote;
	protected get gatt() {
		return this.service.gatt;
	}

	/**
	 * A map of UUID to descriptor that were discovered during {@link discoverDescriptors}.
	 */
	public readonly descriptors: Map<string, GattDescriptorRemote> = new Map();

	/**
	 * Read the current value of this characteristic.
	 */
	public async read(): Promise<Buffer> {
		return this.gatt.read(this.service.uuid, this.uuid);
	}
	/**
	 * Write the specified data to this characteristic.
	 * @param data The data to write.
	 * @param withoutResponse Do not require a response from the remote GATT server for this write.
	 */
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

	/**
	 * Discover all descriptors of this characteristic.
	 */
	public async discoverDescriptors(): Promise<GattDescriptorRemote[]> {
		const descriptors = await this.gatt.discoverDescriptors(this.service.uuid, this.uuid);
		for (const descriptor of descriptors) {
			this.descriptors.set(descriptor.uuid, descriptor);
		}
		return [...this.descriptors.values()];
	}
}
