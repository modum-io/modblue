"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GattServiceRemote = void 0;
const Service_1 = require("../Service");
/**
 * Represents a GATT service of a remote GATT server.
 */
class GattServiceRemote extends Service_1.GattService {
    constructor() {
        super(...arguments);
        /**
         * A map of UUID to characteristic that were discovered during {@link discoverCharacteristics}.
         */
        this.characteristics = new Map();
    }
    /**
     * Discover all charactersitics of this service.
     */
    async discoverCharacteristics() {
        const characteristics = await this.gatt.discoverCharacteristics(this.uuid);
        for (const characteristic of characteristics) {
            this.characteristics.set(characteristic.uuid, characteristic);
        }
        return [...this.characteristics.values()];
    }
}
exports.GattServiceRemote = GattServiceRemote;
//# sourceMappingURL=Service.js.map