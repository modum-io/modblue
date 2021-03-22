var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/* eslint-disable @typescript-eslint/no-var-requires */
import os from 'os';
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
        return __awaiter(this, void 0, void 0, function* () {
            const platform = os.platform();
            if (typeof navigator !== 'undefined' && navigator.bluetooth) {
                return new (yield import('../bindings/web')).WebMODblue();
            } /*else if (platform === 'darwin') {
                console.log('using mac');
                return new (require('../bindings/mac').MacMODblue)();
            }*/
            else if (platform === 'linux' ||
                platform === 'freebsd' ||
                platform === 'win32') {
                return new (yield import('../bindings/hci')).HciMODblue();
            }
            else {
                throw new Error('Unsupported platform');
            }
        });
    }
}
//# sourceMappingURL=MODblue.js.map