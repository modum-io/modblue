"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Noble = void 0;
const Noble_1 = require("../../Noble");
const Adapter_1 = require("./Adapter");
const hci_1 = require("./hci");
class Noble extends Noble_1.BaseNoble {
    constructor() {
        super(...arguments);
        this.adapters = new Map();
    }
    async init() {
        // NO-OP
    }
    async dispose() {
        for (const adapter of this.adapters.values()) {
            adapter.dispose();
        }
        this.adapters = new Map();
    }
    async getAdapters() {
        const adapters = hci_1.Hci.getDeviceList();
        for (const rawAdapter of adapters) {
            let adapter = this.adapters.get(rawAdapter.devId);
            if (!adapter) {
                adapter = new Adapter_1.Adapter(this, `${rawAdapter.devId}`, `hci${rawAdapter.devId}`, 'unkown');
                this.adapters.set(rawAdapter.devId, adapter);
            }
        }
        return [...this.adapters.values()];
    }
}
exports.Noble = Noble;
//# sourceMappingURL=Noble.js.map