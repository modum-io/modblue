import { GattCharacteristicProperty, GattCharacteristicRemote } from '../../../../models';

import { HciGattDescriptorRemote } from './Descriptor';
import { HciGattServiceRemote } from './Service';

export class HciGattCharacteristicRemote extends GattCharacteristicRemote {
	public service: HciGattServiceRemote;

	public readonly startHandle: number;
	public readonly valueHandle: number;
	public endHandle: number;

	public descriptors: Map<string, HciGattDescriptorRemote> = new Map();

	public constructor(
		service: HciGattServiceRemote,
		uuid: string,
		properties: GattCharacteristicProperty[],
		startHandle: number,
		valueHandle: number
	) {
		super(service, uuid, properties);

		this.startHandle = startHandle;
		this.valueHandle = valueHandle;
	}
}
