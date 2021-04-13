"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WinGatt = void 0;
const models_1 = require("../../../models");
const Service_1 = require("./Service");
class WinGatt extends models_1.GattRemote {
    discoverServices() {
        const noble = this.peripheral.adapter.noble;
        this.services.clear();
        noble.discoverServices(this.peripheral.uuid);
        return new Promise((resolve) => {
            const handler = (uuid, serviceUUIDs) => {
                if (uuid === this.peripheral.uuid) {
                    noble.off('servicesDiscover', handler);
                    for (const srvUUID of serviceUUIDs) {
                        this.services.set(srvUUID, new Service_1.WinGattService(this, srvUUID, true));
                    }
                    resolve([...this.services.values()]);
                }
            };
            noble.on('servicesDiscover', handler);
        });
    }
}
exports.WinGatt = WinGatt;
//# sourceMappingURL=Gatt.js.map