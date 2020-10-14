import { Noble } from '../../models';

import { HciAdapter } from './Adapter';
import { Hci } from './misc';

export class HciNoble extends Noble {
	private adapters: Map<number, HciAdapter> = new Map();

	public async dispose() {
		for (const adapter of this.adapters.values()) {
			adapter.dispose();
		}
		this.adapters = new Map();
	}

	public async getAdapters(): Promise<HciAdapter[]> {
		const adapters = Hci.getDeviceList();
		for (const rawAdapter of adapters) {
			let adapter = this.adapters.get(rawAdapter.devId);
			if (!adapter) {
				adapter = new HciAdapter(this, `${rawAdapter.devId}`);
				this.adapters.set(rawAdapter.devId, adapter);
			}
		}
		return [...this.adapters.values()];
	}
}
