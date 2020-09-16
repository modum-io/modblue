"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Descriptor = void 0;
const Descriptor_1 = require("../../Descriptor");
class Descriptor extends Descriptor_1.BaseDescriptor {
    constructor(noble, characteristic, uuid, gatt) {
        super(noble, characteristic, uuid);
        this.gatt = gatt;
    }
    readValue() {
        return new Promise((resolve) => {
            const done = (serviceUUID, characteristicUUID, descriptorUUID, data) => {
                if (serviceUUID !== this.characteristic.service.uuid ||
                    characteristicUUID !== this.characteristic.uuid ||
                    descriptorUUID !== this.uuid) {
                    // This isn't our descriptor, ignore
                    return;
                }
                this.gatt.off('valueRead', done);
                resolve(data);
            };
            this.gatt.on('valueRead', done);
            this.gatt.readValue(this.characteristic.service.uuid, this.characteristic.uuid, this.uuid);
        });
    }
    writeValue(data) {
        return new Promise((resolve) => {
            const done = (serviceUUID, characteristicUUID, descriptorUUID) => {
                if (serviceUUID !== this.characteristic.service.uuid ||
                    characteristicUUID !== this.characteristic.uuid ||
                    descriptorUUID !== this.uuid) {
                    // This isn't our descriptor, ignore
                    return;
                }
                this.gatt.off('valueWrite', done);
                resolve();
            };
            this.gatt.on('valueWrite', done);
            this.gatt.writeValue(this.characteristic.service.uuid, this.characteristic.uuid, this.uuid, data);
        });
    }
}
exports.Descriptor = Descriptor;
//# sourceMappingURL=Descriptor.js.map