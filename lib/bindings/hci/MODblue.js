var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    dispose() {
        return __awaiter(this, void 0, void 0, function* () {
            for (const adapter of this.adapters.values()) {
                adapter.dispose();
            }
            this.adapters = new Map();
        });
    }
    getAdapters() {
        return __awaiter(this, void 0, void 0, function* () {
            const adapters = Hci.getDeviceList();
            for (const rawAdapter of adapters) {
                let adapter = this.adapters.get(rawAdapter.devId);
                if (!adapter) {
                    adapter = new HciAdapter(this, `hci${rawAdapter.devId}`);
                    this.adapters.set(rawAdapter.devId, adapter);
                }
            }
            return [...this.adapters.values()];
        });
    }
}
//# sourceMappingURL=MODblue.js.map