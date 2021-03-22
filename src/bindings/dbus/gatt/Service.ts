import { GattService } from '../../../models';

import { DbusGattCharacteristic } from './Characteristic';
import { DbusGatt } from './Gatt';

export class DbusGattService extends GattService {
	public readonly path: string;

	public characteristics: Map<string, DbusGattCharacteristic> = new Map();

	public constructor(gatt: DbusGatt, uuid: string, isRemote: boolean, path: string) {
		super(gatt, uuid, isRemote);

		this.path = path;
	}
}
