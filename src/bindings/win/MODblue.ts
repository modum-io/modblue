import { Adapter, MODblue } from '../../models';

import { WinAdapter } from './Adapter';
import { NobleBindings } from './bindings';

/**
 * Use the WIN bindings to access BLE functions.
 */
export class WinMODblue extends MODblue {
	private adapters: Map<string, WinAdapter> = new Map();

	public async dispose(): Promise<void> {
		for (const adapter of this.adapters.values()) {
			adapter.dispose();
		}
		this.adapters = new Map();
	}

	public async getAdapters(): Promise<Adapter[]> {
		const radios = await NobleBindings.getAdapterList();
		for (const radio of radios) {
			let adapter = this.adapters.get(radio.name);
			if (!adapter) {
				adapter = new WinAdapter(this, radio);
				this.adapters.set(radio.name, adapter);
			}
		}
		return [...this.adapters.values()];
	}
}
