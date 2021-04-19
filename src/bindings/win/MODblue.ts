import { Adapter, MODblue } from '../../models';

import { WinAdapter } from './Adapter';

/**
 * Use the WIN bindings to access BLE functions.
 */
export class WinMODblue extends MODblue {
	private adapter: WinAdapter;

	public async dispose(): Promise<void> {
		if (this.adapter) {
			this.adapter.dispose();
			this.adapter = null;
		}
	}

	public async getAdapters(): Promise<Adapter[]> {
		if (!this.adapter) {
			this.adapter = new WinAdapter(this, 'win', 'singleton');
		}

		return [this.adapter];
	}
}
