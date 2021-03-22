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
exports.GattService = void 0;
const util_1 = require("util");
const Inspect_1 = require("../Inspect");
/**
 * Represents a GATT service.
 */
class GattService {
    constructor(gatt, uuid, isRemote, characteristics) {
        /**
         * The characteristics that belong to this service, mapped by UUID.
         * If this is a remote service use {@link discoverCharacteristics} to discover them.
         */
        this.characteristics = new Map();
        this.gatt = gatt;
        this.uuid = uuid;
        this.isRemote = isRemote;
        if (characteristics) {
            for (const char of characteristics) {
                this.characteristics.set(char.uuid, char);
            }
        }
    }
    /**
     * Discover all charactersitics of this service.
     */
    discoverCharacteristics() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isRemote) {
                throw new Error('Ĉannot discover characteristics of a local service');
            }
            const characteristics = yield this.gatt.discoverCharacteristics(this.uuid);
            for (const characteristic of characteristics) {
                this.characteristics.set(characteristic.uuid, characteristic);
            }
            return [...this.characteristics.values()];
        });
    }
    toString() {
        return JSON.stringify(this.toJSON());
    }
    toJSON() {
        return {
            uuid: this.uuid,
            gatt: this.gatt
        };
    }
    [Inspect_1.CUSTOM](depth, options) {
        const name = this.constructor.name;
        if (depth < 0) {
            return options.stylize(`[${name}]`, 'special');
        }
        const newOptions = Object.assign(Object.assign({}, options), { depth: options.depth === null ? null : options.depth - 1 });
        const padding = ' '.repeat(name.length + 1);
        const inner = util_1.inspect(this.toJSON(), newOptions).replace(/\n/g, `\n${padding}`);
        return `${options.stylize(name, 'special')} ${inner}`;
    }
}
exports.GattService = GattService;
//# sourceMappingURL=Service.js.map