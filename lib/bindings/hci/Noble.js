"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HciNoble = void 0;
const models_1 = require("../../models");
const Adapter_1 = require("./Adapter");
const misc_1 = require("./misc");
class HciNoble extends models_1.Noble {
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
        var _a;
        const adapters = misc_1.Hci.getDeviceList();
        for (const rawAdapter of adapters) {
            let adapter = this.adapters.get(rawAdapter.devId);
            if (!adapter) {
                adapter = new Adapter_1.HciAdapter(this, `hci${rawAdapter.devId}`, rawAdapter.name, (_a = rawAdapter.address) === null || _a === void 0 ? void 0 : _a.toUpperCase());
                this.adapters.set(rawAdapter.devId, adapter);
            }
        }
        return [...this.adapters.values()];
    }
}
exports.HciNoble = HciNoble;
//# sourceMappingURL=Noble.js.map