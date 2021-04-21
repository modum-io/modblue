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
exports.MacMODblue = void 0;
const models_1 = require("../../models");
const Adapter_1 = require("./Adapter");
/**
 * Use the MAC bindings to access BLE functions.
 */
class MacMODblue extends models_1.MODblue {
    dispose() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.adapter) {
                this.adapter.dispose();
                this.adapter = null;
            }
        });
    }
    getAdapters() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.adapter) {
                this.adapter = new Adapter_1.MacAdapter(this, 'mac', 'singleton');
            }
            return [this.adapter];
        });
    }
}
exports.MacMODblue = MacMODblue;
//# sourceMappingURL=MODblue.js.map