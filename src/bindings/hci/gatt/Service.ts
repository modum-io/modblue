import { GattCharacteristic, GattService } from '../../../models';

import { HciGattCharacteristic } from './Characteristic';
import { HciGattLocal } from './GattLocal';
import { HciGattRemote } from './GattRemote';

export class HciGattService extends GattService {
	public readonly gatt: HciGattRemote | HciGattLocal;
	public readonly characteristics: Map<string, HciGattCharacteristic> = new Map();

	public startHandle: number;
	public endHandle: number;

	public constructor(
		gatt: HciGattRemote | HciGattLocal,
		uuid: string,
		isRemote: boolean,
		startHandle: number,
		endHandle: number
	) {
		super(gatt, uuid, isRemote);

		this.startHandle = startHandle;
		this.endHandle = endHandle;
	}

	public async discoverCharacteristics(): Promise<GattCharacteristic[]> {
		if (this.gatt instanceof HciGattLocal) {
			return [...this.characteristics.values()];
		} else {
			const newChars = await this.gatt.discoverCharacteristics(this.uuid);

			this.characteristics.clear();
			for (const char of newChars) {
				this.characteristics.set(char.uuid, char);
			}

			return newChars;
		}
	}
}
