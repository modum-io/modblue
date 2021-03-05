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
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const adapters = misc_1.Hci.getDeviceList();
            for (const rawAdapter of adapters) {
                let adapter = this.adapters.get(rawAdapter.devId);
                if (!adapter) {
                    adapter = new Adapter_1.HciAdapter(this, `hci${rawAdapter.devId}`, rawAdapter.name, (_a = rawAdapter.address) === null || _a === void 0 ? void 0 : _a.toUpperCase());
                    this.adapters.set(rawAdapter.devId, adapter);
                }
            }
            return [...this.adapters.values()];
        });
    }
}
exports.HciMODblue = HciMODblue;
//# sourceMappingURL=MODblue.js.map