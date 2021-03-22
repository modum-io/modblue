var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { inspect } from 'util';
import { CUSTOM } from '../Inspect';
/**
 * A local or remote GATT server.
 */
export class Gatt {
    constructor(peripheral, adapter, mtu, services) {
        /**
         * The services that belong to this GATT server, mapped by UUID.
         * If this is a remote GATT use {@link discoverServices} to discover them.
         */
        this.services = new Map();
        this.peripheral = peripheral;
        this.adapter = adapter;
        this._mtu = mtu;
        if (services) {
            for (const service of services) {
                this.services.set(service.uuid, service);
            }
        }
    }
    /**
     * True if this is a remote GATT server, false otherwise.
     */
    get isRemote() {
        return !!this.peripheral;
    }
    /**
     * Local: The maximum MTU that will agreed upon during negotiation.
     * Remote: The MTU that was agreed upon during negotiation.
     */
    get mtu() {
        return this._mtu;
    }
    /**
     * Discover all services of this GATT server.
     */
    discoverServices() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isRemote) {
                throw new Error('Can only be used for remote GATT servers');
            }
            const services = yield this.doDiscoverServices();
            for (const service of services) {
                this.services.set(service.uuid, service);
            }
            return [...this.services.values()];
        });
    }
    toString() {
        return JSON.stringify(this.toJSON());
    }
    toJSON() {
        return {};
    }
    [CUSTOM](depth, options) {
        const name = this.constructor.name;
        if (depth < 0) {
            return options.stylize(`[${name}]`, 'special');
        }
        const newOptions = Object.assign(Object.assign({}, options), { depth: options.depth === null ? null : options.depth - 1 });
        const padding = ' '.repeat(name.length + 1);
        const inner = inspect(this.toJSON(), newOptions).replace(/\n/g, `\n${padding}`);
        return `${options.stylize(name, 'special')} ${inner}`;
    }
}
//# sourceMappingURL=Gatt.js.map