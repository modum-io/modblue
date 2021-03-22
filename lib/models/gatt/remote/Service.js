import { GattService } from '../Service';
/**
 * Represents a GATT service of a remote GATT server.
 */
export class GattServiceRemote extends GattService {
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
//# sourceMappingURL=Service.js.map