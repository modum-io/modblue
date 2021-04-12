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
exports.MacPeripheral = void 0;
const models_1 = require("../../models");
const gatt_1 = require("./gatt");
class MacPeripheral extends models_1.Peripheral {
    constructor(adapter, uuid, name, addressType, address, manufacturerData, rssi) {
        super(adapter, uuid, name, addressType, address, manufacturerData, rssi);
    }
    connect(options) {
        return __awaiter(this, void 0, void 0, function* () {
            this._state = 'connecting';
            this.adapter.noble.connect(this.uuid);
            yield new Promise((resolve, reject) => {
                const connHandler = (uuid) => {
                    if (uuid === this.uuid) {
                        this.adapter.noble.off("connect", connHandler);
                        resolve();
                    }
                };
                this.adapter.noble.on("connect", connHandler);
            });
            this._gatt = new gatt_1.MacGatt(this);
            this._state = 'connected';
            return this._gatt;
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            this._state = 'disconnecting';
            this.adapter.noble.disconnect(this.uuid);
            yield new Promise((resolve, reject) => {
                const disconnHandler = (uuid) => {
                    if (uuid === this.uuid) {
                        this.adapter.noble.off("disconnect", disconnHandler);
                        resolve();
                    }
                };
                this.adapter.noble.on("disconnect", disconnHandler);
            });
            this._state = 'disconnected';
        });
    }
}
exports.MacPeripheral = MacPeripheral;
//# sourceMappingURL=Peripheral.js.map