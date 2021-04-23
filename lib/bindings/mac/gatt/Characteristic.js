"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MacGattCharacteristic = void 0;
const models_1 = require("../../../models");
const Descriptor_1 = require("./Descriptor");
class MacGattCharacteristic extends models_1.GattCharacteristic {
    discoverDescriptors() {
        const noble = this.service.gatt.peripheral.adapter.noble;
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
            this.descriptors.clear();
            noble.discoverDescriptors(this.service.gatt.peripheral.uuid, this.service.uuid, this.uuid);
        });
    }
    read() {
        const noble = this.service.gatt.peripheral.adapter.noble;
        return new Promise((resolve) => {
            const handler = (dev, srv, char, data, isNotification) => {
                if (dev === this.service.gatt.peripheral.uuid &&
                    srv === this.service.uuid &&
                    char === this.uuid &&
                    !isNotification) {
                    noble.off('read', handler);
                    resolve(data);
                }
            };
            noble.on('read', handler);
            noble.read(this.service.gatt.peripheral.uuid, this.service.uuid, this.uuid);
        });
    }
    write(value) {
        const noble = this.service.gatt.peripheral.adapter.noble;
        return new Promise((resolve) => {
            const handler = (dev, srv, char) => {
                if (dev === this.service.gatt.peripheral.uuid && srv === this.service.uuid && char === this.uuid) {
                    noble.off('write', handler);
                    resolve();
                }
            };
            noble.on('write', handler);
            noble.write(this.service.gatt.peripheral.uuid, this.service.uuid, this.uuid, value);
        });
    }
    broadcast() {
        throw new Error('Method not implemented.');
    }
    notify(notify) {
        const noble = this.service.gatt.peripheral.adapter.noble;
        return new Promise((resolve) => {
            const handler = (dev, srv, char) => {
                if (dev === this.service.gatt.peripheral.uuid && srv === this.service.uuid && char === this.uuid) {
                    noble.off('notify', handler);
                    resolve();
                }
            };
            noble.on('notify', handler);
            noble.notify(this.service.gatt.peripheral.uuid, this.service.uuid, this.uuid, notify);
        });
    }
    addDescriptor() {
        throw new Error('Method not implemented.');
    }
}
exports.MacGattCharacteristic = MacGattCharacteristic;
//# sourceMappingURL=Characteristic.js.map