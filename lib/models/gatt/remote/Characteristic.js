"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GattCharacteristicRemote = void 0;
const Characteristic_1 = require("../Characteristic");
class GattCharacteristicRemote extends Characteristic_1.GattCharacteristic {
    constructor() {
        super(...arguments);
        this.descriptors = new Map();
    }
    get gatt() {
        return this.service.gatt;
    }
    async read() {
        return this.gatt.read(this.service.uuid, this.uuid);
    }
    async write(data, withoutResponse) {
        await this.gatt.write(this.service.uuid, this.uuid, data, withoutResponse);
    }
    async broadcast(broadcast) {
        await this.gatt.broadcast(this.service.uuid, this.uuid, broadcast);
    }
    async notify(notify) {
        await this.gatt.notify(this.service.uuid, this.uuid, notify);
    }
    async subscribe() {
        await this.notify(true);
    }
    async unsubscribe() {
        await this.notify(false);
    }
    async discoverDescriptors() {
        const descriptors = await this.gatt.discoverDescriptors(this.service.uuid, this.uuid);
        for (const descriptor of descriptors) {
            this.descriptors.set(descriptor.uuid, descriptor);
        }
        return [...this.descriptors.values()];
    }
}
exports.GattCharacteristicRemote = GattCharacteristicRemote;
//# sourceMappingURL=Characteristic.js.map