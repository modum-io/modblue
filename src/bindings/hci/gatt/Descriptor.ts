import { GattDescriptor } from '../../../models';

import { HciGattCharacteristic } from './Characteristic';

export class HciGattDescriptor extends GattDescriptor {
	public characteristic: HciGattCharacteristic;

	public readonly handle: number;

	public constructor(characteristic: HciGattCharacteristic, uuid: string, isRemote: boolean, handle: number) {
		super(characteristic, uuid, isRemote);

		this.handle = handle;
	}
}
