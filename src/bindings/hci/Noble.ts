import { BaseAdapter } from '../../Adapter';
import { BaseNoble } from '../../Noble';

import { Adapter } from './Adapter';
import { Hci } from './hci';

export class Noble extends BaseNoble {
	private adapters: Map<number, BaseAdapter> = new Map();

	public async init() {
		// NO-OP
	}

	public async dispose() {
		// NO-OP
	}

	public async getAdapters() {
		const adapters = Hci.getDeviceList();
		for (const rawAdapter of adapters) {
			let adapter = this.adapters.get(rawAdapter.devId);
			if (!adapter) {
				adapter = new Adapter(this, `${rawAdapter.devId}`, `hci${rawAdapter.devId}`, 'unkown');
				this.adapters.set(rawAdapter.devId, adapter);
			}
		}
		return [...this.adapters.values()];
	}
}
