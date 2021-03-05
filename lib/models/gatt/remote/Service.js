"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    discoverCharacteristics() {
        return __awaiter(this, void 0, void 0, function* () {
            const characteristics = yield this.gatt.discoverCharacteristics(this.uuid);
            for (const characteristic of characteristics) {
                this.characteristics.set(characteristic.uuid, characteristic);
            }
            return [...this.characteristics.values()];
        });
    }
}
exports.GattServiceRemote = GattServiceRemote;
//# sourceMappingURL=Service.js.map