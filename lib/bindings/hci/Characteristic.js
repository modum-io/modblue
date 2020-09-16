"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Characteristic = void 0;
const Characteristic_1 = require("../../Characteristic");
const Descriptor_1 = require("./Descriptor");
class Characteristic extends Characteristic_1.BaseCharacteristic {
    constructor(noble, service, uuid, properties, gatt) {
        super(noble, service, uuid, properties);
        this.descriptors = new Map();
        this.gatt = gatt;
    }
    getDiscoveredDescriptors() {
        return [...this.descriptors.values()];
    }
    async read() {
        return new Promise((resolve) => {
            const done = (serviceUUID, characteristicUUID, data) => {
                if (serviceUUID !== this.service.uuid || characteristicUUID !== this.uuid) {
                    // This isn't our characteristic, ignore
                    return;
                }
                this.gatt.off('read', done);
                resolve(data);
            };
            this.gatt.on('read', done);
            this.gatt.read(this.service.uuid, this.uuid);
        });
    }
    async write(data, withoutResponse) {
        return new Promise((resolve) => {
            const done = (serviceUUID, characteristicUUID) => {
                if (serviceUUID !== this.service.uuid || characteristicUUID !== this.uuid) {
                    // This isn't our characteristic, ignore
                    return;
                }
                this.gatt.off('write', done);
                resolve();
            };
            this.gatt.on('write', done);
            this.gatt.write(this.service.uuid, this.uuid, data, withoutResponse);
        });
    }
    async broadcast(broadcast) {
        return new Promise((resolve) => {
            const done = (serviceUUID, characteristicUUID, newBroadcast) => {
                if (serviceUUID !== this.service.uuid || characteristicUUID !== this.uuid) {
                    // This isn't our characteristic, ignore
                    return;
                }
                this.gatt.off('broadcast', done);
                resolve(newBroadcast);
            };
            this.gatt.on('broadcast', done);
            this.gatt.broadcast(this.service.uuid, this.uuid, broadcast);
        });
    }
    async notify(notify) {
        return new Promise((resolve) => {
            const done = (serviceUUID, characteristicUUID, newNotify) => {
                if (serviceUUID !== this.service.uuid || characteristicUUID !== this.uuid) {
                    // This isn't our characteristic, ignore
                    return;
                }
                this.gatt.off('notify', done);
                resolve(newNotify);
            };
            this.gatt.on('notify', done);
            this.gatt.notify(this.service.uuid, this.uuid, notify);
        });
    }
    async subscribe() {
        await this.notify(true);
    }
    async unsubscribe() {
        await this.notify(false);
    }
    async discoverDescriptors() {
        return new Promise((resolve) => {
            const done = (serviceUUID, characteristicUUID, descriptors) => {
                if (serviceUUID !== this.service.uuid || characteristicUUID !== this.uuid) {
                    // This isn't our characteristic, ignore
                    return;
                }
                this.gatt.off('descriptorsDiscovered', done);
                for (const rawDescriptor of descriptors) {
                    let descriptor = this.descriptors.get(rawDescriptor.uuid);
                    if (!descriptor) {
                        descriptor = new Descriptor_1.Descriptor(this.noble, this, rawDescriptor.uuid, this.gatt);
                        this.descriptors.set(rawDescriptor.uuid, descriptor);
                    }
                }
                resolve([...this.descriptors.values()]);
            };
            this.gatt.on('descriptorsDiscovered', done);
            this.gatt.discoverDescriptors(this.service.uuid, this.uuid);
        });
    }
}
exports.Characteristic = Characteristic;
//# sourceMappingURL=Characteristic.js.map