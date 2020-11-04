import { Descriptor } from '../../models';

import { HciCharacteristic } from './Characteristic';
import { Gatt } from './gatt';
import { HciNoble } from './Noble';

export class HciDescriptor extends Descriptor {
	private gatt: Gatt;

	public constructor(noble: HciNoble, characteristic: HciCharacteristic, uuid: string, gatt: Gatt) {
		super(noble, characteristic, uuid);

		this.gatt = gatt;
	}

	public readValue(): Promise<Buffer> {
		return this.gatt.readValue(this.characteristic.service.uuid, this.characteristic.uuid, this.uuid);
	}

	public writeValue(data: Buffer): Promise<void> {
		return this.gatt.writeValue(this.characteristic.service.uuid, this.characteristic.uuid, this.uuid, data);
	}
}
