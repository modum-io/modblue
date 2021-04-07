"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Gatt = void 0;
const util_1 = require("util");
const Inspect_1 = require("../Inspect");
/**
 * A local or remote GATT server.
 */
class Gatt {
    constructor(peripheral, adapter, mtu, services) {
        /**
         * The services that belong to this GATT server, mapped by UUID.
         * If this is a remote GATT use {@link discoverServices} to discover them.
         */
        this.services = new Map();
        this.peripheral = peripheral;
        this.adapter = adapter;
        this._mtu = mtu;
        if (services) {
            for (const service of services) {
                this.services.set(service.uuid, service);
            }
        }
    }
    /**
     * True if this is a remote GATT server, false otherwise.
     */
    get isRemote() {
        return !!this.peripheral;
    }
    /**
     * Local: The maximum MTU that will agreed upon during negotiation.
     * Remote: The MTU that was agreed upon during negotiation.
     */
    get mtu() {
        return this._mtu;
    }
    toString() {
        return JSON.stringify(this.toJSON());
    }
    toJSON() {
        return {};
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
exports.Gatt = Gatt;
//# sourceMappingURL=Gatt.js.map