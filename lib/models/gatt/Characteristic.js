var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { TypedEmitter } from 'tiny-typed-emitter';
import { inspect } from 'util';
import { CUSTOM } from '../Inspect';
/**
 * Represents a GATT Characteristic.
 */
export class GattCharacteristic extends TypedEmitter {
    constructor(service, uuid, isRemote, propsOrFlag, secureOrFlag, readFunc, writeFunc, descriptors) {
        super();
        /**
         * The descriptors that belong to this characteristic, mapped by UUID.
         * If this is a remote characteristic use {@link discoverDescriptors} to discover them.
         */
        this.descriptors = new Map();
        this.service = service;
        this.uuid = uuid;
        this.isRemote = isRemote;
        let properties = [];
        let secure = [];
        let propertyFlag = 0;
        let secureFlag = 0;
        if (typeof propsOrFlag === 'object') {
            properties = propsOrFlag;
            if (propsOrFlag.includes('read')) {
                propertyFlag |= 0x02;
            }
            if (propsOrFlag.includes('write-without-response')) {
                propertyFlag |= 0x04;
            }
            if (propsOrFlag.includes('write')) {
                propertyFlag |= 0x08;
            }
            if (propsOrFlag.includes('notify')) {
                propertyFlag |= 0x10;
            }
            if (propsOrFlag.includes('indicate')) {
                propertyFlag |= 0x20;
            }
        }
        else {
            propertyFlag = propsOrFlag;
            if (propsOrFlag & 0x01) {
                properties.push('broadcast');
            }
            if (propsOrFlag & 0x02) {
                properties.push('read');
            }
            if (propsOrFlag & 0x04) {
                properties.push('write-without-response');
            }
            if (propsOrFlag & 0x08) {
                properties.push('write');
            }
            if (propsOrFlag & 0x10) {
                properties.push('notify');
            }
            if (propsOrFlag & 0x20) {
                properties.push('indicate');
            }
            if (propsOrFlag & 0x40) {
                properties.push('authenticated-signed-writes');
            }
            if (propsOrFlag & 0x80) {
                properties.push('extended-properties');
            }
        }
        if (typeof secureOrFlag === 'object') {
            secure = secureOrFlag;
            if (secureOrFlag.includes('read')) {
                secureFlag |= 0x02;
            }
            if (secureOrFlag.includes('write-without-response')) {
                secureFlag |= 0x04;
            }
            if (secureOrFlag.includes('write')) {
                secureFlag |= 0x08;
            }
            if (secureOrFlag.includes('notify')) {
                secureFlag |= 0x10;
            }
            if (secureOrFlag.includes('indicate')) {
                secureFlag |= 0x20;
            }
        }
        else {
            secureFlag = secureOrFlag;
            if (secureOrFlag & 0x01) {
                secure.push('broadcast');
            }
            if (secureOrFlag & 0x02) {
                secure.push('read');
            }
            if (secureOrFlag & 0x04) {
                secure.push('write-without-response');
            }
            if (secureOrFlag & 0x08) {
                secure.push('write');
            }
            if (secureOrFlag & 0x10) {
                secure.push('notify');
            }
            if (secureOrFlag & 0x20) {
                secure.push('indicate');
            }
            if (secureOrFlag & 0x40) {
                secure.push('authenticated-signed-writes');
            }
            if (secureOrFlag & 0x80) {
                secure.push('extended-properties');
            }
        }
        this.properties = properties;
        this.secure = secure;
        this.propertyFlag = propertyFlag;
        this.secureFlag = secureFlag;
        this.readFunc = readFunc;
        this.writeFunc = writeFunc;
        if (descriptors) {
            for (const descriptor of descriptors) {
                this.descriptors.set(descriptor.uuid, descriptor);
            }
        }
    }
    get gatt() {
        return this.service.gatt;
    }
    /**
     * Discover all descriptors of this characteristic.
     */
    discoverDescriptors() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isRemote) {
                throw new Error('Can only be used for remote characteristic');
            }
            const descriptors = yield this.gatt.discoverDescriptors(this.service.uuid, this.uuid);
            for (const descriptor of descriptors) {
                this.descriptors.set(descriptor.uuid, descriptor);
            }
            return [...this.descriptors.values()];
        });
    }
    /**
     * Read the current value of this characteristic.
     */
    read() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isRemote) {
                throw new Error('Can only be used for remote characteristic');
            }
            return this.gatt.readCharacteristic(this.service.uuid, this.uuid);
        });
    }
    /**
     * Write the specified data to this characteristic.
     * @param data The data to write.
     * @param withoutResponse Do not require a response from the remote GATT server for this write.
     */
    write(data, withoutResponse) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isRemote) {
                throw new Error('Can only be used for remote characteristic');
            }
            yield this.gatt.writeCharacteristic(this.service.uuid, this.uuid, data, withoutResponse);
        });
    }
    /**
     * Enable or disable broadcasts.
     * @param broadcast True to enable broadcasts, false otherwise.
     */
    broadcast(broadcast) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isRemote) {
                throw new Error('Can only be used for remote characteristic');
            }
            yield this.gatt.broadcastCharacteristic(this.service.uuid, this.uuid, broadcast);
        });
    }
    /**
     * Enable or disable notifications.
     * @param notify True to enable notifies, false otherwise.
     */
    notify(notify) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isRemote) {
                throw new Error('Can only be used for remote characteristic');
            }
            yield this.gatt.notifyCharacteristic(this.service.uuid, this.uuid, notify);
        });
    }
    /**
     * Enable notifications. Equivalent to calling {@link notify} with `true`.
     */
    subscribe() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isRemote) {
                throw new Error('Can only be used for remote characteristic');
            }
            yield this.notify(true);
        });
    }
    /**
     * Disable nofitications. Equivalent to calling {@link notify} with `false`.
     */
    unsubscribe() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isRemote) {
                throw new Error('Can only be used for remote characteristic');
            }
            yield this.notify(false);
        });
    }
    handleRead(offset) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isRemote) {
                throw new Error('Can only be used for local characteristic');
            }
            return this.readFunc(offset);
        });
    }
    handleWrite(offset, data, withoutResponse) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isRemote) {
                throw new Error('Can only be used for local characteristic');
            }
            return this.writeFunc(offset, data, withoutResponse);
        });
    }
    toString() {
        return JSON.stringify(this.toJSON());
    }
    toJSON() {
        return {
            uuid: this.uuid,
            properties: this.properties,
            secure: this.secure,
            service: this.service
        };
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
//# sourceMappingURL=Characteristic.js.map