"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GattDescriptor = void 0;
const util_1 = require("util");
/**
 * Represents a GATT Descriptor.
 */
class GattDescriptor {
    constructor(characteristic, uuid) {
        this.characteristic = characteristic;
        this.uuid = uuid;
    }
    toString() {
        return JSON.stringify(this.toJSON());
    }
    toJSON() {
        return {
            uuid: this.uuid,
            characteristic: this.characteristic
        };
    }
    [util_1.inspect.custom](depth, options) {
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
exports.GattDescriptor = GattDescriptor;
//# sourceMappingURL=Descriptor.js.map