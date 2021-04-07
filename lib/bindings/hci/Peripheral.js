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
exports.HciPeripheral = void 0;
const models_1 = require("../../models");
const gatt_1 = require("./gatt");
const misc_1 = require("./misc");
// 512 bytes is max char size + 1 byte att opcode + 2 bytes handle + 2 bytes offset for long writes
const DEFAULT_MTU = 517;
class HciPeripheral extends models_1.Peripheral {
    get isMaster() {
        return this._isMaster;
    }
    connect(options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._state === 'connected') {
                return;
            }
            this._state = 'connecting';
            yield this.adapter.connect(this, options === null || options === void 0 ? void 0 : options.minInterval, options === null || options === void 0 ? void 0 : options.maxInterval, options === null || options === void 0 ? void 0 : options.latency, options === null || options === void 0 ? void 0 : options.supervisionTimeout);
            yield this._gatt.exchangeMtu((options === null || options === void 0 ? void 0 : options.mtu) || DEFAULT_MTU);
            return this._gatt;
        });
    }
    onConnect(isMaster, hci, handle) {
        this.hci = hci;
        this.handle = handle;
        this._isMaster = isMaster;
        this.signaling = new misc_1.Signaling(this.hci, this.handle);
        this._gatt = new gatt_1.HciGattRemote(this, hci, handle);
        this._state = 'connected';
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._state === 'disconnected') {
                return;
            }
            this._state = 'disconnecting';
            yield this.adapter.disconnect(this);
        });
    }
    onDisconnect(reason) {
        if (this._gatt) {
            this._gatt.dispose(reason);
            this._gatt = null;
        }
        if (this.signaling) {
            this.signaling.dispose();
            this.signaling = null;
        }
        this.hci = null;
        this.handle = null;
        this._state = 'disconnected';
    }
}
exports.HciPeripheral = HciPeripheral;
//# sourceMappingURL=Peripheral.js.map