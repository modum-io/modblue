"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MacGatt = void 0;
const models_1 = require("../../../models");
const Service_1 = require("./Service");
class MacGatt extends models_1.GattRemote {
    discoverServices() {
        const noble = this.peripheral.adapter.noble;
        this.services.clear();
        noble.discoverServices(this.peripheral.uuid);
        return new Promise((resolve, reject) => {
            const handler = (uuid, serviceUUIDs) => {
                if (uuid === this.peripheral.uuid) {
                    noble.off("servicesDiscover", handler);
                    for (const srvUUID of serviceUUIDs) {
                        this.services.set(srvUUID, new Service_1.MacGattService(this, srvUUID, true));
                    }
                    resolve([...this.services.values()]);
                }
            };
            noble.on("servicesDiscover", handler);
        });
    }
}
exports.MacGatt = MacGatt;
//# sourceMappingURL=Gatt.js.map