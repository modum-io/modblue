import { GattCharacteristicProperty, GattCharacteristicRemote } from '../../../../models';

import { DbusGattServiceRemote } from './Service';

export class DbusGattCharacteristicRemote extends GattCharacteristicRemote {
	public readonly path: string;

	public constructor(
		service: DbusGattServiceRemote,
		path: string,
		uuid: string,
		properties: GattCharacteristicProperty[]
	) {
		super(service, uuid, properties);

		this.path = path;
	}
}
