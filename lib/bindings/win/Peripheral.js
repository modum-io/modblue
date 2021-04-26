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
exports.WinPeripheral = void 0;
const models_1 = require("../../models");
const gatt_1 = require("./gatt");
class WinPeripheral extends models_1.Peripheral {
    constructor(adapter, uuid, name, addressType, address, manufacturerData, rssi) {
        super(adapter, uuid, name, addressType, address, manufacturerData, rssi);
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            this._state = 'connecting';
            yield new Promise((res, rej) => {
                const cleanup = () => {
                    clearTimeout(timer);
                    this.adapter.noble.off('connect', connHandler);
                };
                const resolve = () => {
                    cleanup();
                    res();
                };
                const reject = (err) => {
                    cleanup();
                    rej(err);
                };
                const timer = setTimeout(() => reject(new Error('Connecting timed out')), 10000);
                const connHandler = (uuid, err) => {
                    if (uuid === this.uuid) {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve();
                        }
                    }
                };
                this.adapter.noble.on('connect', connHandler);
                this.adapter.noble.connect(this.uuid);
            });
            this._gatt = new gatt_1.WinGatt(this);
            this._state = 'connected';
            return this._gatt;
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            this._state = 'disconnecting';
            yield new Promise((res) => {
                const resolve = () => {
                    clearTimeout(timer);
                    this.adapter.noble.off('connect', disconnHandler);
                    res();
                };
                const timer = setTimeout(resolve, 10000);
                const disconnHandler = (uuid) => {
                    if (uuid === this.uuid) {
                        resolve();
                    }
                };
                this.adapter.noble.on('disconnect', disconnHandler);
                this.adapter.noble.disconnect(this.uuid);
            });
            this._state = 'disconnected';
        });
    }
}
exports.WinPeripheral = WinPeripheral;
//# sourceMappingURL=Peripheral.js.map