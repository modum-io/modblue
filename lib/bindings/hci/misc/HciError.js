"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HciError = void 0;
class HciError extends Error {
    constructor(message, details) {
        super(message);
        this.name = 'HciError';
        this.details = details;
    }
}
exports.HciError = HciError;
//# sourceMappingURL=HciError.js.map