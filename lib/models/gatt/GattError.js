"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GattError = void 0;
class GattError extends Error {
    constructor(peripheral, message, details) {
        super(message);
        this.name = 'GattError';
        this.peripheral = peripheral;
        this.details = details;
    }
}
exports.GattError = GattError;
//# sourceMappingURL=GattError.js.map