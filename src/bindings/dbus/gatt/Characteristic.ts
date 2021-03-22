import { GattCharacteristic, GattCharacteristicProperty } from '../../../models';

import { DbusGattService } from './Service';

export class DbusGattCharacteristic extends GattCharacteristic {
	public readonly path: string;

	public constructor(
		service: DbusGattService,
		uuid: string,
		isRemote: boolean,
		properties: GattCharacteristicProperty[],
		secure: GattCharacteristicProperty[],
		path: string
	) {
		super(service, uuid, isRemote, properties, secure);

		this.path = path;
	}
}
