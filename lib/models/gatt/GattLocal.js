"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GattLocal = void 0;
const util_1 = require("util");
const Inspect_1 = require("../Inspect");
const Gatt_1 = require("./Gatt");
/**
 * A local GATT server.
 */
class GattLocal extends Gatt_1.Gatt {
    constructor(adapter, mtu, services) {
        super(mtu, services);
        this.adapter = adapter;
        if (services) {
            for (const service of services) {
                this.services.set(service.uuid, service);
            }
        }
    }
    get isRemote() {
        return false;
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
exports.GattLocal = GattLocal;
//# sourceMappingURL=GattLocal.js.map