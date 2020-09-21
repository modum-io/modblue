import { BaseAdapter } from '../../Adapter';
import { BaseNoble } from '../../Noble';

import { Adapter } from './Adapter';
import { Hci } from './hci';

export class Noble extends BaseNoble {
	private adapters: Map<number, Adapter> = new Map();

	public async init() {
		// NO-OP
	}

	public async dispose() {
		for (const adapter of this.adapters.values()) {
			adapter.dispose();
		}
		this.adapters = new Map();
	}

	public async getAdapters(): Promise<BaseAdapter[]> {
		const adapters = Hci.getDeviceList();
		for (const rawAdapter of adapters) {
			let adapter = this.adapters.get(rawAdapter.devId);
			if (!adapter) {
				adapter = new Adapter(this, `${rawAdapter.devId}`);
				this.adapters.set(rawAdapter.devId, adapter);
			}
		}
		return [...this.adapters.values()];
	}
}
