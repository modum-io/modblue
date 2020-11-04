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
		propertiesFlag: number,
		secureFlag: number,
		startHandle: number,
		valueHandle: number
	) {
		super(service, uuid, propertiesFlag, secureFlag);

		this.startHandle = startHandle;
		this.valueHandle = valueHandle;
	}
}
