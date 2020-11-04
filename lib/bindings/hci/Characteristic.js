"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HciCharacteristic = void 0;
const Characteristic_1 = require("../../Characteristic");
const Descriptor_1 = require("./Descriptor");
class HciCharacteristic extends Characteristic_1.Characteristic {
    constructor(noble, service, uuid, properties, gatt) {
        super(noble, service, uuid, properties);
        this.descriptors = new Map();
        this.gatt = gatt;
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
    getDiscoveredDescriptors() {
        return [...this.descriptors.values()];
    }
    async discoverDescriptors(uuids) {
        const descriptors = await this.gatt.discoverDescriptors(this.service.uuid, this.uuid, uuids || []);
        for (const rawDescriptor of descriptors) {
            let descriptor = this.descriptors.get(rawDescriptor.uuid);
            if (!descriptor) {
                descriptor = new Descriptor_1.HciDescriptor(this.noble, this, rawDescriptor.uuid, this.gatt);
                this.descriptors.set(rawDescriptor.uuid, descriptor);
            }
        }
        return [...this.descriptors.values()];
    }
}
exports.HciCharacteristic = HciCharacteristic;
//# sourceMappingURL=Characteristic.js.map