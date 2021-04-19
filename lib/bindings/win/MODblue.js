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
exports.WinMODblue = void 0;
const models_1 = require("../../models");
const Adapter_1 = require("./Adapter");
/**
 * Use the WIN bindings to access BLE functions.
 */
class WinMODblue extends models_1.MODblue {
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
                this.adapter = new Adapter_1.WinAdapter(this, 'win', 'singleton');
            }
            return [this.adapter];
        });
    }
}
exports.WinMODblue = WinMODblue;
//# sourceMappingURL=MODblue.js.map