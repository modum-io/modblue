import { GattServiceRemote } from '../../../../models';

import { DbusGattCharacteristicRemote } from './Characteristic';
import { DbusGattRemote } from './Gatt';

export class DbusGattServiceRemote extends GattServiceRemote {
	public readonly path: string;

	public characteristics: Map<string, DbusGattCharacteristicRemote> = new Map();

	public constructor(gatt: DbusGattRemote, path: string, uuid: string) {
		super(gatt, uuid);

		this.path = path;
	}
}
