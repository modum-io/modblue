"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GattRemote = void 0;
const Gatt_1 = require("../Gatt");
class GattRemote extends Gatt_1.Gatt {
    constructor(peripheral) {
        super();
        this.services = new Map();
        this.peripheral = peripheral;
    }
    get mtu() {
        return this._mtu;
    }
    toString() {
        return JSON.stringify({
            mtu: this.mtu,
            peripheralUUID: this.peripheral.uuid
        });
    }
    async discoverServices() {
        const services = await this.doDiscoverServices();
        for (const service of services) {
            this.services.set(service.uuid, service);
        }
        return [...this.services.values()];
    }
}
exports.GattRemote = GattRemote;
//# sourceMappingURL=Gatt.js.map