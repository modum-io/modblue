"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GattError = void 0;
class GattError extends Error {
    constructor(peripheral, message) {
        super(message);
        this.name = 'GattError';
        this.peripheral = peripheral;
    }
}
exports.GattError = GattError;
//# sourceMappingURL=GattError.js.map