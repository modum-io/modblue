/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * Main class to interface with BLE.
 * Scan for adapters and use an adapter to perform specific actions.
 */
export class MODblue {
    /**
     * Tries to automatically detect the current platform and use the most appropriate BLE bindings.
     * @returns The MODblue instance for this platform
     */
    static autoDetectBindings() {
        const platform = require('os')?.platform();
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
//# sourceMappingURL=MODblue.js.map