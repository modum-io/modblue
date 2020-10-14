import { GattLocal } from '../../../../models';
import { HciAdapter } from '../../Adapter';

export class HciGattLocal extends GattLocal {
	public constructor(adapter: HciAdapter) {
		super(adapter);
	}
}
