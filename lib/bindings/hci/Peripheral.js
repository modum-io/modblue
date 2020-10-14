"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HciPeripheral = void 0;
const models_1 = require("../../models");
const misc_1 = require("./misc");
class HciPeripheral extends models_1.Peripheral {
    constructor() {
        super(...arguments);
        this.onConnectionParameterUpdateRequest = (minInterval, maxInterval, latency, supervisionTimeout) => {
            this.hci.connUpdateLe(this.handle, minInterval, maxInterval, latency, supervisionTimeout);
        };
    }
    async connect() {
        this._state = 'connecting';
        await this.adapter.connect(this);
    }
    async onConnect(hci, handle) {
        this.hci = hci;
        this.handle = handle;
        // this.gatt = new HciGattRemote(this, hci, handle);
        this.signaling = new misc_1.Signaling(hci, handle);
        this.signaling.on('connectionParameterUpdateRequest', this.onConnectionParameterUpdateRequest);
        this._state = 'connected';
    }
    async disconnect() {
        this._state = 'disconnecting';
        return this.adapter.disconnect(this);
    }
    onDisconnect() {
        this.signaling.off('connectionParameterUpdateRequest', this.onConnectionParameterUpdateRequest);
        this.signaling.dispose();
        this.signaling = null;
        this.hci = null;
        this.gatt = null;
        this.handle = null;
        this._state = 'disconnected';
    }
    async setupGatt(requestMtu) {
        if (this.gatt) {
            return this.gatt;
        }
        await this.gatt.exchangeMtu(requestMtu || 256);
        return this.gatt;
    }
}
exports.HciPeripheral = HciPeripheral;
//# sourceMappingURL=Peripheral.js.map