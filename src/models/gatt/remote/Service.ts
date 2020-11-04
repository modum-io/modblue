import { GattService } from '../Service';

import { GattCharacteristicRemote } from './Characteristic';
import { GattRemote } from './Gatt';

export class GattServiceRemote extends GattService {
	public readonly gatt: GattRemote;

	public readonly characteristics: Map<string, GattCharacteristicRemote> = new Map();

	public async discoverCharacteristics(): Promise<GattCharacteristicRemote[]> {
		const characteristics = await this.gatt.discoverCharacteristics(this.uuid);
		for (const characteristic of characteristics) {
			this.characteristics.set(characteristic.uuid, characteristic);
		}
		return [...this.characteristics.values()];
	}
}
