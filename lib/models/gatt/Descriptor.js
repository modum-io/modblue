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
exports.GattDescriptor = void 0;
const util_1 = require("util");
const Inspect_1 = require("../Inspect");
/**
 * Represents a GATT Descriptor.
 */
class GattDescriptor {
    constructor(characteristic, uuid, isRemote, value) {
        this.characteristic = characteristic;
        this.uuid = uuid;
        this.isRemote = isRemote;
        this.value = value;
    }
    get gatt() {
        return this.characteristic.service.gatt;
    }
    /**
     * Read the current value of this descriptor.
     */
    read() {
        if (!this.isRemote) {
            throw new Error('Can only be used for remote descriptors');
        }
        return this.gatt.readDescriptor(this.characteristic.service.uuid, this.characteristic.uuid, this.uuid);
    }
    /**
     * Writes the specified data to this descriptor.
     * @param data The data to write.
     */
    write(data) {
        if (!this.isRemote) {
            throw new Error('Can only be used for remote descriptors');
        }
        return this.gatt.writeDescriptor(this.characteristic.service.uuid, this.characteristic.uuid, this.uuid, data);
    }
    handleRead(offset) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isRemote) {
                throw new Error('Can only be used for local descriptors');
            }
            return [0, this.value.slice(offset)];
        });
    }
    handleWrite(offset, data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isRemote) {
                throw new Error('Can only be used for local descriptors');
            }
            this.value = data;
            return 0;
        });
    }
    toString() {
        return JSON.stringify(this.toJSON());
    }
    toJSON() {
        return {
            uuid: this.uuid,
            characteristic: this.characteristic
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
exports.GattDescriptor = GattDescriptor;
//# sourceMappingURL=Descriptor.js.map