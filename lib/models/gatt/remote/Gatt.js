var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    discoverServices() {
        return __awaiter(this, void 0, void 0, function* () {
            const services = yield this.doDiscoverServices();
            for (const service of services) {
                this.services.set(service.uuid, service);
            }
            return [...this.services.values()];
        });
    }
    toJSON() {
        return Object.assign(Object.assign({}, super.toJSON()), { mtu: this.mtu, peripheral: this.peripheral });
    }
}
//# sourceMappingURL=Gatt.js.map