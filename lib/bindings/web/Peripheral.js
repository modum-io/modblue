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
exports.WebPeripheral = void 0;
const models_1 = require("../../models");
const gatt_1 = require("./gatt");
class WebPeripheral extends models_1.Peripheral {
    constructor(adapter, id, device) {
        super(adapter, id, 'unknown', null, {}, 0);
        this.device = device;
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            const gatt = yield this.device.gatt.connect();
            this._gatt = new gatt_1.WebGatt(this, gatt);
            return this._gatt;
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            this._gatt.disconnect();
        });
    }
}
exports.WebPeripheral = WebPeripheral;
//# sourceMappingURL=Peripheral.js.map