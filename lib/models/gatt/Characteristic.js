"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GattCharacteristic = void 0;
const util_1 = require("util");
/**
 * Represents a GATT Characteristic.
 */
class GattCharacteristic {
    constructor(service, uuid, propsOrFlag, secureOrFlag) {
        this.service = service;
        this.uuid = uuid;
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
    [util_1.inspect.custom](depth, options) {
        const name = this.constructor.name;
        if (depth < 0) {
            return options.stylize(`[${name}]`, 'special');
        }
        const newOptions = { ...options, depth: options.depth === null ? null : options.depth - 1 };
        const padding = ' '.repeat(name.length + 1);
        const inner = util_1.inspect(this.toJSON(), newOptions).replace(/\n/g, `\n${padding}`);
        return `${options.stylize(name, 'special')} ${inner}`;
    }
}
exports.GattCharacteristic = GattCharacteristic;
//# sourceMappingURL=Characteristic.js.map