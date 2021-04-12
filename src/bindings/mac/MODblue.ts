import { Adapter, MODblue } from '../../models';

import { MacAdapter } from './Adapter';

/**
 * Use the MAC bindings to access BLE functions.
 */
export class MacMODblue extends MODblue {
	private adapter: MacAdapter;

	public async dispose(): Promise<void> {
		if (this.adapter) {
			this.adapter.dispose();
			this.adapter = null;
		}
	}

	public async getAdapters(): Promise<Adapter[]> {
		if (!this.adapter) {
			this.adapter = new MacAdapter(this, 'mac', 'mac');
		}

		return [this.adapter];
	}
}
