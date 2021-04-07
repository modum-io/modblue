"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Peripheral = void 0;
const util_1 = require("util");
const Inspect_1 = require("./Inspect");
/**
 * Represents a peripheral that was found during scanning.
 */
class Peripheral {
    constructor(adapter, uuid, name, addressType, address, advertisement, rssi) {
        this.adapter = adapter;
        this.uuid = uuid;
        this.name = name;
        this.addressType = addressType;
        this.address = address;
        this.advertisement = advertisement;
        this.rssi = rssi;
        this._state = 'disconnected';
    }
    get gatt() {
        if (this.state !== 'connected') {
            throw new Error('GATT is only available when connected');
        }
        return this._gatt;
    }
    /**
     * The current state of the peripheral.
     */
    get state() {
        return this._state;
    }
    toString() {
        return JSON.stringify(this.toJSON());
    }
    toJSON() {
        return {
            uuid: this.uuid,
            address: this.address,
            addressType: this.addressType,
            rssi: this.rssi,
            state: this._state,
            adapter: this.adapter
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
exports.Peripheral = Peripheral;
//# sourceMappingURL=Peripheral.js.map