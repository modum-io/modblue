"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Gatt = void 0;
class Gatt {
    constructor() {
        this._mtu = null;
    }
    get mtu() {
        return this._mtu;
    }
    toString() {
        return JSON.stringify({
            mtu: this.mtu
        });
    }
}
exports.Gatt = Gatt;
//# sourceMappingURL=Gatt.js.map