"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HciMODblue = void 0;
const models_1 = require("../../models");
const Adapter_1 = require("./Adapter");
const misc_1 = require("./misc");
/**
 * Use the HCI socket bindings to access BLE functions.
 */
class HciMODblue extends models_1.MODblue {
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
            const adapters = misc_1.Hci.getDeviceList();
            for (const rawAdapter of adapters) {
                const id = typeof rawAdapter.devId !== 'undefined'
                    ? `${rawAdapter.devId}`
                    : `${rawAdapter.busNumber}-${rawAdapter.deviceAddress}`;
                let adapter = this.adapters.get(id);
                if (!adapter) {
                    adapter = new Adapter_1.HciAdapter(this, id, `hci-${id}`);
                    this.adapters.set(id, adapter);
                }
            }
            return [...this.adapters.values()];
        });
    }
}
exports.HciMODblue = HciMODblue;
//# sourceMappingURL=MODblue.js.map