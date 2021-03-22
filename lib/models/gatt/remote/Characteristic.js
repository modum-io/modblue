var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { GattCharacteristic } from '../Characteristic';
/**
 * Represents a characteristic connected to a remote GATT service.
 */
export class GattCharacteristicRemote extends GattCharacteristic {
    constructor() {
        super(...arguments);
        /**
         * A map of UUID to descriptor that were discovered during {@link discoverDescriptors}.
         */
        this.descriptors = new Map();
    }
    get gatt() {
        return this.service.gatt;
    }
    /**
     * Read the current value of this characteristic.
     */
    read() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.gatt.read(this.service.uuid, this.uuid);
        });
    }
    /**
     * Write the specified data to this characteristic.
     * @param data The data to write.
     * @param withoutResponse Do not require a response from the remote GATT server for this write.
     */
    write(data, withoutResponse) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.gatt.write(this.service.uuid, this.uuid, data, withoutResponse);
        });
    }
    broadcast(broadcast) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.gatt.broadcast(this.service.uuid, this.uuid, broadcast);
        });
    }
    notify(notify) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.gatt.notify(this.service.uuid, this.uuid, notify);
        });
    }
    subscribe() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.notify(true);
        });
    }
    unsubscribe() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.notify(false);
        });
    }
    /**
     * Discover all descriptors of this characteristic.
     */
    discoverDescriptors() {
        return __awaiter(this, void 0, void 0, function* () {
            const descriptors = yield this.gatt.discoverDescriptors(this.service.uuid, this.uuid);
            for (const descriptor of descriptors) {
                this.descriptors.set(descriptor.uuid, descriptor);
            }
            return [...this.descriptors.values()];
        });
    }
}
//# sourceMappingURL=Characteristic.js.map