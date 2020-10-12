import { GattCharacteristicProperty, GattCharacteristicRemote } from '../../../../models';
import { BusObject } from '../../misc';

import { DbusGattServiceRemote } from './Service';

export class DbusGattCharacteristicRemote extends GattCharacteristicRemote {
	public readonly busObject: BusObject;

	public constructor(
		service: DbusGattServiceRemote,
		uuid: string,
		properties: GattCharacteristicProperty[],
		busObject: BusObject
	) {
		super(service, uuid, properties);

		this.busObject = busObject;
	}
}
