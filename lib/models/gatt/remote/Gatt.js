import { Gatt } from '../Gatt';
/**
 * Represents a GATT server on a remote {@link Peripheral}.
 */
export class GattRemote extends Gatt {
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
    toJSON() {
        return {
            ...super.toJSON(),
            mtu: this.mtu,
            peripheral: this.peripheral
        };
    }
}
//# sourceMappingURL=Gatt.js.map