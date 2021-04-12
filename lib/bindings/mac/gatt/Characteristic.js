"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MacGattCharacteristic = void 0;
const models_1 = require("../../../models");
class MacGattCharacteristic extends models_1.GattCharacteristic {
    discoverDescriptors() {
        throw new Error("Method not implemented.");
    }
    read() {
        const noble = this.service.gatt.peripheral.adapter.noble;
        noble.read(this.service.gatt.peripheral.uuid, this.service.uuid, this.uuid);
        return new Promise((resolve, reject) => {
            const handler = (uuid, serviceUUID, charUUID, data) => {
                if (uuid === this.service.gatt.peripheral.uuid && serviceUUID === this.service.uuid && charUUID === this.uuid) {
                    noble.off("read", handler);
                    resolve(data);
                }
            };
            noble.on("read", handler);
        });
    }
    write(data, withoutResponse) {
        throw new Error("Method not implemented.");
    }
    broadcast(broadcast) {
        throw new Error("Method not implemented.");
    }
    notify(notify) {
        throw new Error("Method not implemented.");
    }
    addDescriptor(uuid, value) {
        throw new Error("Method not implemented.");
    }
}
exports.MacGattCharacteristic = MacGattCharacteristic;
//# sourceMappingURL=Characteristic.js.map