"use strict";
/* eslint-disable @typescript-eslint/no-var-requires */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MODblue = void 0;
/**
 * Main class to interface with BLE.
 * Scan for adapters and use an adapter to perform specific actions.
 */
class MODblue {
    /**
     * Tries to automatically detect the current platform and use the most appropriate BLE bindings.
     * @returns The MODblue instance for this platform
     */
    static autoDetectBindings() {
        var _a;
        const platform = (_a = require('os')) === null || _a === void 0 ? void 0 : _a.platform();
        if (typeof navigator !== 'undefined' && navigator.bluetooth) {
            console.log('using web');
            return new (require('../bindings/web').WebMODblue)();
        } /*else if (platform === 'darwin') {
            console.log('using mac');
            return new (require('../bindings/mac').MacMODblue)();
        }*/
        else if (platform === 'linux' ||
            platform === 'freebsd' ||
            platform === 'win32') {
            return new (require('../bindings/hci').HciMODblue)();
        }
        else {
            throw new Error('Unsupported platform');
        }
    }
}
exports.MODblue = MODblue;
//# sourceMappingURL=MODblue.js.map