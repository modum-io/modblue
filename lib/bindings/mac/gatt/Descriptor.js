"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MacGattDescriptor = void 0;
const models_1 = require("../../../models");
class MacGattDescriptor extends models_1.GattDescriptor {
    read() {
        const noble = this.characteristic.service.gatt.peripheral.adapter.noble;
        noble.readValue(this.characteristic.service.gatt.peripheral.uuid, this.characteristic.service.uuid, this.characteristic.uuid, this.uuid);
        return new Promise((resolve) => {
            const handler = (dev, srv, char, desc, data) => {
                if (dev === this.characteristic.service.gatt.peripheral.uuid &&
                    srv === this.characteristic.service.uuid &&
                    char === this.characteristic.uuid &&
                    desc === this.uuid) {
                    noble.off('valueRead', handler);
                    resolve(data);
                }
            };
            noble.on('valueRead', handler);
        });
    }
    write(value) {
        const noble = this.characteristic.service.gatt.peripheral.adapter.noble;
        noble.writeValue(this.characteristic.service.gatt.peripheral.uuid, this.characteristic.service.uuid, this.characteristic.uuid, this.uuid, value);
        return new Promise((resolve) => {
            const handler = (dev, srv, char, desc) => {
                if (dev === this.characteristic.service.gatt.peripheral.uuid &&
                    srv === this.characteristic.service.uuid &&
                    char === this.characteristic.uuid &&
                    desc === this.uuid) {
                    noble.off('valueWrite', handler);
                    resolve();
                }
            };
            noble.on('valueWrite', handler);
        });
    }
}
exports.MacGattDescriptor = MacGattDescriptor;
//# sourceMappingURL=Descriptor.js.map