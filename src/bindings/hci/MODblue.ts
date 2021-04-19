import { Adapter, MODblue } from '../../models';

import { HciAdapter } from './Adapter';
import { Hci } from './misc';

/**
 * Use the HCI socket bindings to access BLE functions.
 */
export class HciMODblue extends MODblue {
	private adapters: Map<string, HciAdapter> = new Map();

	public async dispose(): Promise<void> {
		for (const adapter of this.adapters.values()) {
			adapter.dispose();
		}
		this.adapters = new Map();
	}

	public async getAdapters(): Promise<Adapter[]> {
		const adapters = Hci.getDeviceList();
		for (const rawAdapter of adapters) {
			const id = rawAdapter.devId ? `${rawAdapter.devId}` : `${rawAdapter.busNumber}-${rawAdapter.deviceAddress}`;
			let adapter = this.adapters.get(id);
			if (!adapter) {
				adapter = new HciAdapter(this, id, id);
				this.adapters.set(id, adapter);
			}
		}
		return [...this.adapters.values()];
	}
}
