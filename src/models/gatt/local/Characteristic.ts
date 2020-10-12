import { GattCharacteristic, GattCharacteristicProperty } from '../Characteristic';

import { GattDescriptorLocal } from './Descriptor';
import { GattServiceLocal } from './Service';

export class GattCharacteristicLocal extends GattCharacteristic {
	public readonly service: GattServiceLocal;

	public readonly descriptors: GattDescriptorLocal[];

	public constructor(
		service: GattServiceLocal,
		uuid: string,
		properties: GattCharacteristicProperty[],
		descriptors: GattDescriptorLocal[]
	) {
		super(service, uuid, properties);

		this.descriptors = descriptors;
	}
}
