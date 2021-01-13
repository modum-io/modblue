"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Adapter = void 0;
const tiny_typed_emitter_1 = require("tiny-typed-emitter");
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
    toString() {
        return JSON.stringify({
            id: this.id,
            name: this.name,
            address: this.address
        });
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
}
exports.Adapter = Adapter;
//# sourceMappingURL=Adapter.js.map