import { BaseDescriptor } from '../../Descriptor';

import { Characteristic } from './Characteristic';
import { Gatt } from './gatt';
import { Noble } from './Noble';

export class Descriptor extends BaseDescriptor {
	private gatt: Gatt;

	public constructor(noble: Noble, characteristic: Characteristic, uuid: string, gatt: Gatt) {
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
