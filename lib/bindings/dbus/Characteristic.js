"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbusCharacteristic = void 0;
const Characteristic_1 = require("../../Characteristic");
const BusObject_1 = require("./BusObject");
const TypeValue_1 = require("./TypeValue");
class DbusCharacteristic extends Characteristic_1.Characteristic {
    constructor(noble, service, uuid, properties, object) {
        super(noble, service, uuid, properties);
        this.object = object;
    }
    prop(propName) {
        return this.object.prop(BusObject_1.I_BLUEZ_CHARACTERISTIC, propName);
    }
    callMethod(methodName, ...args) {
        return this.object.callMethod(BusObject_1.I_BLUEZ_CHARACTERISTIC, methodName, ...args);
    }
    async read(offset = 0) {
        const options = {
            offset: TypeValue_1.buildTypedValue('uint16', offset)
        };
        const payload = await this.callMethod('ReadValue', options);
        return Buffer.from(payload);
    }
    async write(data, withoutResponse) {
        const options = {
            offset: TypeValue_1.buildTypedValue('uint16', 0),
            type: TypeValue_1.buildTypedValue('string', withoutResponse ? 'command' : 'request')
        };
        await this.callMethod('WriteValue', [...data], options);
    }
    broadcast(broadcast) {
        throw new Error('Method not implemented.');
    }
    subscribe() {
        throw new Error('Method not implemented.');
    }
    unsubscribe() {
        throw new Error('Method not implemented.');
    }
    getDiscoveredDescriptors() {
        throw new Error('Method not implemented.');
    }
    discoverDescriptors() {
        throw new Error('Method not implemented.');
    }
}
exports.DbusCharacteristic = DbusCharacteristic;
//# sourceMappingURL=Characteristic.js.map