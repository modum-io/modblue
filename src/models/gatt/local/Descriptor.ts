import { GattDescriptor } from '../Descriptor';

import { GattCharacteristicLocal } from './Characteristic';

export class GattDescriptorLocal extends GattDescriptor {
	public readonly characteristic: GattCharacteristicLocal;

	public readonly value: Buffer;

	public constructor(characteristic: GattCharacteristicLocal, uuid: string, value: Buffer) {
		super(characteristic, uuid);

		this.value = value;
	}
}
