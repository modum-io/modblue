"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebPeripheral = void 0;
const models_1 = require("../../models");
class WebPeripheral extends models_1.Peripheral {
    constructor(adapter, id, advertisement, rssi) {
        super(adapter, id, 'unknown', null, advertisement, rssi);
    }
    connect(minInterval, maxInterval, latency, supervisionTimeout) {
        throw new Error('Method not implemented.');
    }
    disconnect() {
        throw new Error('Method not implemented.');
    }
    setupGatt(requestMtu) {
        throw new Error('Method not implemented.');
    }
}
exports.WebPeripheral = WebPeripheral;
//# sourceMappingURL=Peripheral.js.map