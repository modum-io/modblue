"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WinGattDescriptor = void 0;
const models_1 = require("../../../models");
class WinGattDescriptor extends models_1.GattDescriptor {
    read() {
        const noble = this.characteristic.service.gatt.peripheral.adapter.noble;
        noble.readValue(this.characteristic.service.gatt.peripheral.uuid, this.characteristic.service.uuid, this.characteristic.uuid, this.uuid);
        return new Promise((resolve, reject) => {
            const handler = (dev, srv, char, desc, data) => {
                if (dev === this.characteristic.service.gatt.peripheral.uuid &&
                    srv === this.characteristic.service.uuid &&
                    char === this.characteristic.uuid &&
                    desc === this.uuid) {
                    noble.off('valueRead', handler);
                    if (data instanceof Error) {
                        reject(data);
                    }
                    else {
                        resolve(data);
                    }
                }
            };
            noble.on('valueRead', handler);
        });
    }
    write(value) {
        const noble = this.characteristic.service.gatt.peripheral.adapter.noble;
        noble.writeValue(this.characteristic.service.gatt.peripheral.uuid, this.characteristic.service.uuid, this.characteristic.uuid, this.uuid, value);
        return new Promise((resolve, reject) => {
            const handler = (dev, srv, char, desc, err) => {
                if (dev === this.characteristic.service.gatt.peripheral.uuid &&
                    srv === this.characteristic.service.uuid &&
                    char === this.characteristic.uuid &&
                    desc === this.uuid) {
                    noble.off('valueWrite', handler);
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                }
            };
            noble.on('valueWrite', handler);
        });
    }
}
exports.WinGattDescriptor = WinGattDescriptor;
//# sourceMappingURL=Descriptor.js.map