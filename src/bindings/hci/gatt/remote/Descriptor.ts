import { GattDescriptorRemote } from '../../../../models';

import { HciGattCharacteristicRemote } from './Characteristic';

export class HciGattDescriptorRemote extends GattDescriptorRemote {
	public characteristic: HciGattCharacteristicRemote;

	public readonly handle: number;

	public constructor(characteristic: HciGattCharacteristicRemote, uuid: string, handle: number) {
		super(characteristic, uuid);

		this.handle = handle;
	}
}
