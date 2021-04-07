import { Adapter, MODblue } from '../../models';

import { WebAdapter } from './Adapter';

/**
 * Use the web-bluetooth bindings to access BLE functions.
 */
export class WebMODblue extends MODblue {
	private adapter: WebAdapter;

	public async dispose(): Promise<void> {
		if (this.adapter) {
			this.adapter.dispose();
			this.adapter = null;
		}
	}

	public async getAdapters(): Promise<Adapter[]> {
		if (!this.adapter) {
			this.adapter = new WebAdapter(this, 'web', 'web');
		}

		return [this.adapter];
	}
}
