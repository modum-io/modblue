import { GattServiceRemote } from '../../../../models';
import { BusObject } from '../../misc';

import { DbusGattCharacteristicRemote } from './Characteristic';
import { DbusGattRemote } from './Gatt';

export class DbusGattServiceRemote extends GattServiceRemote {
	public readonly busObject: BusObject;

	public characteristics: Map<string, DbusGattCharacteristicRemote> = new Map();

	public constructor(gatt: DbusGattRemote, uuid: string, busObject: BusObject) {
		super(gatt, uuid);

		this.busObject = busObject;
	}
}
