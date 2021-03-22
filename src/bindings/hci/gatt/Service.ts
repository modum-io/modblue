import { GattService } from '../../../models';

import { HciGattCharacteristic } from './Characteristic';
import { HciGattRemote } from './GattRemote';

export class HciGattService extends GattService {
	public readonly startHandle: number;
	public readonly endHandle: number;

	public characteristics: Map<string, HciGattCharacteristic> = new Map();

	public constructor(gatt: HciGattRemote, uuid: string, isRemote: boolean, startHandle: number, endHandle: number) {
		super(gatt, uuid, isRemote);

		this.startHandle = startHandle;
		this.endHandle = endHandle;
	}
}
