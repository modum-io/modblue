import { MODblue } from '../../models';
import { HciAdapter } from './Adapter';
import { Hci } from './misc';
/**
 * Use the HCI socket bindings to access BLE functions.
 */
export class HciMODblue extends MODblue {
    constructor() {
        super(...arguments);
        this.adapters = new Map();
    }
    async dispose() {
        for (const adapter of this.adapters.values()) {
            adapter.dispose();
        }
        this.adapters = new Map();
    }
    async getAdapters() {
        const adapters = Hci.getDeviceList();
        for (const rawAdapter of adapters) {
            let adapter = this.adapters.get(rawAdapter.devId);
            if (!adapter) {
                adapter = new HciAdapter(this, `hci${rawAdapter.devId}`);
                this.adapters.set(rawAdapter.devId, adapter);
            }
        }
        return [...this.adapters.values()];
    }
}
//# sourceMappingURL=MODblue.js.map