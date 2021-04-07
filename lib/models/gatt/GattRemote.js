"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GattRemote = void 0;
const Gatt_1 = require("./Gatt");
/**
 * A remote GATT server.
 */
class GattRemote extends Gatt_1.Gatt {
    constructor(peripheral, mtu) {
        super(mtu);
        this.peripheral = peripheral;
    }
    get isRemote() {
        return true;
    }
    toJSON() {
        return Object.assign(Object.assign({}, super.toJSON()), { peripheral: this.peripheral });
    }
}
exports.GattRemote = GattRemote;
//# sourceMappingURL=GattRemote.js.map