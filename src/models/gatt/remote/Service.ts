import { GattService } from '../Service';

import { GattCharacteristicRemote } from './Characteristic';
import { GattRemote } from './Gatt';

/**
 * Represents a GATT service of a remote GATT server.
 */
export class GattServiceRemote extends GattService {
	/**
	 * The remote GATT server that this service belongs to.
	 */
	public readonly gatt: GattRemote;

	/**
	 * A map of UUID to characteristic that were discovered during {@link discoverCharacteristics}.
	 */
	public readonly characteristics: Map<string, GattCharacteristicRemote> = new Map();

	/**
	 * Discover all charactersitics of this service.
	 */
	public async discoverCharacteristics(): Promise<GattCharacteristicRemote[]> {
		const characteristics = await this.gatt.discoverCharacteristics(this.uuid);
		for (const characteristic of characteristics) {
			this.characteristics.set(characteristic.uuid, characteristic);
		}
		return [...this.characteristics.values()];
	}
}
