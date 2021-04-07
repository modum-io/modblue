"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildTypedValue = void 0;
/* eslint-disable @typescript-eslint/no-var-requires */
// This fixes an issue with webpack trying to load the module at compile time
let Variant;
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
    if (!Variant) {
        // This fixes an issue with webpack trying to load the module at compile time
        const END = 't';
        Variant = require(`dbus-nex${END}`).Variant;
    }
    return new Variant(dbusTypes.join(''), value);
}
exports.buildTypedValue = buildTypedValue;
//# sourceMappingURL=TypeValue.js.map