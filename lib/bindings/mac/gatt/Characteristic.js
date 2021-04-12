"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MacGattCharacteristic = void 0;
const models_1 = require("../../../models");
const Descriptor_1 = require("./Descriptor");
class MacGattCharacteristic extends models_1.GattCharacteristic {
    discoverDescriptors() {
        const noble = this.service.gatt.peripheral.adapter.noble;
        this.descriptors.clear();
        noble.discoverDescriptors(this.service.gatt.peripheral.uuid, this.service.uuid, this.uuid);
        return new Promise((resolve) => {
            const handler = (dev, srv, char, descUUIDs) => {
                if (dev === this.service.gatt.peripheral.uuid && srv === this.service.uuid && char === this.uuid) {
                    noble.off('descriptorsDiscover', handler);
                    for (const descUUID of descUUIDs) {
                        this.descriptors.set(descUUID, new Descriptor_1.MacGattDescriptor(this, descUUID, true));
                    }
                    resolve([...this.descriptors.values()]);
                }
            };
            noble.on('descriptorsDiscover', handler);
        });
    }
    read() {
        const noble = this.service.gatt.peripheral.adapter.noble;
        noble.read(this.service.gatt.peripheral.uuid, this.service.uuid, this.uuid);
        return new Promise((resolve) => {
            const handler = (dev, srv, char, data, isNotification) => {
                if (dev === this.service.gatt.peripheral.uuid &&
                    srv === this.service.uuid &&
                    char === this.uuid &&
                    isNotification) {
                    noble.off('read', handler);
                    resolve(data);
                }
            };
            noble.on('read', handler);
        });
    }
    write(value) {
        const noble = this.service.gatt.peripheral.adapter.noble;
        noble.write(this.service.gatt.peripheral.uuid, this.service.uuid, this.uuid, value);
        return new Promise((resolve) => {
            const handler = (dev, srv, char) => {
                if (dev === this.service.gatt.peripheral.uuid && srv === this.service.uuid && char === this.uuid) {
                    noble.off('write', handler);
                    resolve();
                }
            };
            noble.on('write', handler);
        });
    }
    broadcast() {
        throw new Error('Method not implemented.');
    }
    notify(notify) {
        const noble = this.service.gatt.peripheral.adapter.noble;
        noble.notify(this.service.gatt.peripheral.uuid, this.service.uuid, this.uuid, notify);
        return new Promise((resolve) => {
            const handler = (dev, srv, char) => {
                if (dev === this.service.gatt.peripheral.uuid && srv === this.service.uuid && char === this.uuid) {
                    noble.off('notify', handler);
                    resolve();
                }
            };
            noble.on('notify', handler);
        });
    }
    addDescriptor() {
        throw new Error('Method not implemented.');
    }
}
exports.MacGattCharacteristic = MacGattCharacteristic;
//# sourceMappingURL=Characteristic.js.map