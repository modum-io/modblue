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
exports.WebMODblue = void 0;
const models_1 = require("../../models");
const Adapter_1 = require("./Adapter");
/**
 * Use the web-bluetooth bindings to access BLE functions.
 */
class WebMODblue extends models_1.MODblue {
    dispose() {
        return __awaiter(this, void 0, void 0, function* () {
            this.adapter = null;
        });
    }
    getAdapters() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.adapter) {
                this.adapter = new Adapter_1.WebAdapter(this, 'web', 'web');
            }
            return [this.adapter];
        });
    }
}
exports.WebMODblue = WebMODblue;
//# sourceMappingURL=MODblue.js.map