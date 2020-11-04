"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildTypedValue = void 0;
const { Variant } = require('dbus-next');
// https://dbus.freedesktop.org/doc/dbus-specification.html
const MAPPINGS = {
    string: 's',
    int16: 'n',
    boolean: 'b',
    uint16: 'q',
    dict: 'e',
    array: 'a',
    variant: 'v'
};
function buildTypedValue(types, value) {
    const dbusTypes = Array.isArray(types) ? types.map((type) => MAPPINGS[type]) : [MAPPINGS[types]];
    if (dbusTypes.some((type) => !type)) {
        throw new Error(`Unknown type ${types} for value ${value}`);
    }
    return new Variant(dbusTypes.join(''), value);
}
exports.buildTypedValue = buildTypedValue;
//# sourceMappingURL=TypeValue.js.map