import { MODblue } from '../../models';
import { WebAdapter } from './Adapter';
/**
 * Use the web-bluetooth bindings to access BLE functions.
 */
export class WebMODblue extends MODblue {
    async dispose() {
        this.adapter = null;
    }
    async getAdapters() {
        if (!this.adapter) {
            this.adapter = new WebAdapter(this, 'web', 'web');
        }
        return [this.adapter];
    }
}
//# sourceMappingURL=MODblue.js.map