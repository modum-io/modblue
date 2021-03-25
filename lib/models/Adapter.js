"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Adapter = void 0;
const tiny_typed_emitter_1 = require("tiny-typed-emitter");
const util_1 = require("util");
const Inspect_1 = require("./Inspect");
class Adapter extends tiny_typed_emitter_1.TypedEmitter {
    constructor(modblue, id, name, address) {
        super();
        this.modblue = modblue;
        this.id = id;
        this._name = name || `hci${id.replace('hci', '')}`;
        this._address = address === null || address === void 0 ? void 0 : address.toLowerCase();
    }
    /**
     * The public name of this adapter.
     */
    get name() {
        return this._name;
    }
    /**
     * The MAC address type of this adapter.
     */
    get addressType() {
        return this._addressType;
    }
    /**
     * The MAC address of this adapter. All lowercase, with colon separator between bytes, e.g. 11:22:33:aa:bb:cc
     */
    get address() {
        return this._address;
    }
    /**
     * Scans for a specific {@link Peripheral} using the specified matching function and returns the peripheral once found.
     * If the timeout is reached before finding a peripheral the returned promise will be rejected.
     * @param filter Either a string that is used as name prefix, or a function that returns `true` if the specified peripheral is the peripheral we're looking for.
     * @param timeoutInSeconds The timeout in seconds. The returned promise will reject once the timeout is reached.
     * @param serviceUUIDs The UUIDs of the {@link GattService}s that must be contained in the advertisement data.
     */
    scanFor(filter, timeoutInSeconds = 10, serviceUUIDs) {
        return __awaiter(this, void 0, void 0, function* () {
            const origScope = new Error();
            return new Promise((resolve, reject) => {
                let timeout;
                const onDiscover = (peripheral) => {
                    if (typeof filter === 'function') {
                        if (filter(peripheral)) {
                            resolveHandler(peripheral);
                        }
                    }
                    else {
                        if (peripheral.name && peripheral.name.toLowerCase().startsWith(filter.toLowerCase())) {
                            resolveHandler(peripheral);
                        }
                    }
                };
                const cleanup = () => {
                    this.stopScanning();
                    this.off('discover', onDiscover);
                    if (timeout) {
                        clearTimeout(timeout);
                        timeout = null;
                    }
                };
                const resolveHandler = (peripheral) => {
                    cleanup();
                    resolve(peripheral);
                };
                const rejectHandler = (error) => __awaiter(this, void 0, void 0, function* () {
                    cleanup();
                    if (error) {
                        error.stack = error.stack + '\n' + origScope.stack;
                    }
                    reject(error);
                });
                this.on('discover', onDiscover);
                this.startScanning(serviceUUIDs, true).catch((err) => rejectHandler(err));
                const timeoutError = new Error(`Scanning timed out`);
                timeout = setTimeout(() => rejectHandler(timeoutError), timeoutInSeconds * 1000);
            });
        });
    }
    toString() {
        return JSON.stringify(this.toJSON());
    }
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            address: this.address
        };
    }
    [Inspect_1.CUSTOM](depth, options) {
        const name = this.constructor.name;
        if (depth < 0) {
            return options.stylize(`[${name}]`, 'special');
        }
        const newOptions = Object.assign(Object.assign({}, options), { depth: options.depth === null ? null : options.depth - 1 });
        const padding = ' '.repeat(name.length + 1);
        const inner = util_1.inspect(this.toJSON(), newOptions).replace(/\n/g, `\n${padding}`);
        return `${options.stylize(name, 'special')} ${inner}`;
    }
}
exports.Adapter = Adapter;
//# sourceMappingURL=Adapter.js.map