"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HciPeripheral = void 0;
const models_1 = require("../../models");
const gatt_1 = require("./gatt");
const misc_1 = require("./misc");
class HciPeripheral extends models_1.Peripheral {
    async connect() {
        this._state = 'connecting';
        await this.adapter.connect(this);
    }
    async onConnect(hci, handle) {
        this.hci = hci;
        this.handle = handle;
        this.hci = hci;
        this.signaling = new misc_1.Signaling(this.hci, this.handle);
        this.gatt = new gatt_1.HciGattRemote(this, hci, handle);
        await this.gatt.exchangeMtu(256);
        this.mtuExchanged = true;
        this._state = 'connected';
    }
    async disconnect() {
        this._state = 'disconnecting';
        await this.adapter.disconnect(this);
    }
    async onDisconnect() {
        if (this.gatt) {
            this.gatt.dispose();
            this.gatt = null;
        }
        if (this.signaling) {
            this.signaling.dispose();
            this.signaling = null;
        }
        this.gatt.dispose();
        this.gatt = null;
        this.hci = null;
        this.handle = null;
        this._state = 'disconnected';
    }
    async setupGatt(requestMtu) {
        if (this.state !== 'connected' || !this.handle) {
            throw new Error(`Peripheral is not connected`);
        }
        /*if (!this.mtuExchanged) {
            await this.gatt.exchangeMtu(requestMtu || 256);
            this.mtuExchanged = true;
        }*/
        return this.gatt;
    }
}
exports.HciPeripheral = HciPeripheral;
//# sourceMappingURL=Peripheral.js.map