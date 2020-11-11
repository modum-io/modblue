"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GattRemote = void 0;
const Gatt_1 = require("../Gatt");
/**
 * Represents a GATT server on a remote {@link Peripheral}.
 */
class GattRemote extends Gatt_1.Gatt {
    constructor(peripheral) {
        super();
        /**
         * A map of UUID to services that were discovered during {@link discoverServices}.
         */
        this.services = new Map();
        this.peripheral = peripheral;
    }
    /**
     * The MTU that was agreed upon during the MTU negotiation.
     */
    get mtu() {
        return this._mtu;
    }
    toString() {
        return JSON.stringify({
            mtu: this.mtu,
            peripheralUUID: this.peripheral.uuid
        });
    }
    /**
     * Discover all services of this GATT server.
     */
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