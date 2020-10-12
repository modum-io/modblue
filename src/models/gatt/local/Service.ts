import { GattService } from '../Service';

import { GattCharacteristicLocal } from './Characteristic';
import { GattLocal } from './Gatt';

export class GattServiceLocal extends GattService {
	public readonly gatt: GattLocal;

	public readonly characteristics: GattCharacteristicLocal[];

	public constructor(gatt: GattLocal, uuid: string, characteristics: GattCharacteristicLocal[]) {
		super(gatt, uuid);

		this.characteristics = characteristics;
	}
}
