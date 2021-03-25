"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MODblue = void 0;
/* eslint-disable @typescript-eslint/no-var-requires */
const os_1 = __importDefault(require("os"));
/**
 * Main class to interface with BLE.
 * Scan for adapters and use an adapter to perform specific actions.
 */
class MODblue {
    /**
     * Tries to automatically detect the current platform and use the most appropriate BLE bindings.
     */
    static autoDetectBindings() {
        return __awaiter(this, void 0, void 0, function* () {
            const platform = os_1.default.platform();
            if (typeof navigator !== 'undefined' && navigator.bluetooth) {
                return new (yield Promise.resolve().then(() => __importStar(require('../bindings/web')))).WebMODblue();
            } /*else if (platform === 'darwin') {
                console.log('using mac');
                return new (require('../bindings/mac').MacMODblue)();
            }*/
            else if (platform === 'linux' ||
                platform === 'freebsd' ||
                platform === 'win32') {
                return new (yield Promise.resolve().then(() => __importStar(require('../bindings/hci')))).HciMODblue();
            }
            else {
                throw new Error('Unsupported platform');
            }
        });
    }
}
exports.MODblue = MODblue;
//# sourceMappingURL=MODblue.js.map