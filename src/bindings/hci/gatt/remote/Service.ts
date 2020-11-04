import { GattServiceRemote } from '../../../../models';

import { HciGattCharacteristicRemote } from './Characteristic';
import { HciGattRemote } from './Gatt';

export class HciGattServiceRemote extends GattServiceRemote {
	public gatt: HciGattRemote;

	public readonly startHandle: number;
	public readonly endHandle: number;

	public characteristics: Map<string, HciGattCharacteristicRemote> = new Map();

	public constructor(gatt: HciGattRemote, uuid: string, startHandle: number, endHandle: number) {
		super(gatt, uuid);

		this.startHandle = startHandle;
		this.endHandle = endHandle;
	}
}
