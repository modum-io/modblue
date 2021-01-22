"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Adapter = void 0;
const tiny_typed_emitter_1 = require("tiny-typed-emitter");
const util_1 = require("util");
class Adapter extends tiny_typed_emitter_1.TypedEmitter {
    constructor(modblue, id, name, address) {
        super();
        this.modblue = modblue;
        this.id = id;
        this._name = name || `hci${id.replace('hci', '')}`;
        this._address = address;
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
     * The MAC address of this adapter.
     */
    get address() {
        return this._address;
    }
    /**
     * Scans for a specific {@link Peripheral} using the specified matching function and returns the peripheral once found.
     * If the timeout is reached before finding a peripheral the returned promise will be rejected.
     * @param isTarget A function that returns `true` if the specified peripheral is the peripheral we're looking for.
     * @param timeoutInSeconds The timeout in seconds. The returned promise will reject once the timeout is reached.
     * @param serviceUUIDs The UUIDs of the {@link GattServiceRemote}s that must be contained in the advertisement data.
     */
    async scanFor(isTarget, timeoutInSeconds = 10, serviceUUIDs) {
        let onDiscover;
        const scan = new Promise((resolve) => {
            onDiscover = (peripheral) => {
                if (isTarget(peripheral)) {
                    this.off('discover', onDiscover);
                    resolve(peripheral);
                }
            };
            this.on('discover', onDiscover);
        });
        await this.startScanning(serviceUUIDs, true);
        // Create error outside scope to preserve stack trace
        const timeoutErr = new Error(`Scan timed out`);
        const timeout = new Promise((_, reject) => setTimeout(() => reject(timeoutErr), timeoutInSeconds * 1000));
        try {
            const res = await Promise.race([scan, timeout]);
            await this.stopScanning();
            return res;
        }
        catch (err) {
            this.off('discover', onDiscover);
            await this.stopScanning();
            throw err;
        }
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
    [util_1.inspect.custom](depth, options) {
        const name = this.constructor.name;
        if (depth < 0) {
            return options.stylize(`[${name}]`, 'special');
        }
        const newOptions = { ...options, depth: options.depth === null ? null : options.depth - 1 };
        const padding = ' '.repeat(name.length + 1);
        const inner = util_1.inspect(this.toJSON(), newOptions).replace(/\n/g, `\n${padding}`);
        return `${options.stylize(name, 'special')} ${inner}`;
    }
}
exports.Adapter = Adapter;
//# sourceMappingURL=Adapter.js.map