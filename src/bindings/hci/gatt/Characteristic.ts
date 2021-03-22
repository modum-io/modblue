import { GattCharacteristic } from '../../../models';

import { HciGattDescriptor } from './Descriptor';
import { HciGattService } from './Service';

export class HciGattCharacteristic extends GattCharacteristic {
	public service: HciGattService;

	public readonly startHandle: number;
	public readonly valueHandle: number;
	public endHandle: number;

	public descriptors: Map<string, HciGattDescriptor> = new Map();

	public constructor(
		service: HciGattService,
		uuid: string,
		isRemote: boolean,
		propertiesFlag: number,
		secureFlag: number,
		startHandle: number,
		valueHandle: number
	) {
		super(service, uuid, isRemote, propertiesFlag, secureFlag);

		this.startHandle = startHandle;
		this.valueHandle = valueHandle;
	}
}
