"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Peripheral = void 0;
const Peripheral_1 = require("../../Peripheral");
const Service_1 = require("./Service");
class Peripheral extends Peripheral_1.BasePeripheral {
    constructor() {
        super(...arguments);
        this.services = new Map();
        this.onMtu = (mtu) => {
            this._mtu = mtu;
        };
    }
    getDiscoveredServices() {
        return [...this.services.values()];
    }
    async connect(requestMtu) {
        this._state = 'connecting';
        this._mtu = requestMtu;
        await this.adapter.connect(this, requestMtu);
    }
    onConnect(aclStream, gatt, signaling) {
        this._state = 'connected';
        this.aclStream = aclStream;
        this.gatt = gatt;
        this.signaling = signaling;
        gatt.on('mtu', this.onMtu);
    }
    async disconnect() {
        this._state = 'disconnecting';
        return this.adapter.disconnect(this);
    }
    onDisconnect() {
        this._state = 'disconnected';
        this.aclStream.push(null, null);
        this.gatt.removeAllListeners();
        this.signaling.removeAllListeners();
    }
    async discoverServices(serviceUUIDs) {
        return new Promise((resolve) => {
            const done = (services) => {
                this.gatt.off('servicesDiscovered', done);
                for (const rawService of services) {
                    let service = this.services.get(rawService.uuid);
                    if (!service) {
                        service = new Service_1.Service(this.noble, this, rawService.uuid, this.gatt);
                        this.services.set(rawService.uuid, service);
                    }
                }
                resolve([...this.services.values()]);
            };
            this.gatt.on('servicesDiscovered', done);
            this.gatt.discoverServices(serviceUUIDs || []);
        });
    }
    async discoverIncludedServices(baseService, serviceUUIDs) {
        return new Promise((resolve) => {
            const done = (serviceUUID, services) => {
                if (serviceUUID !== this.uuid) {
                    // This isn't our service, ignore
                    return;
                }
                this.gatt.off('includedServicesDiscovered', done);
                for (const rawService of services) {
                    let service = this.services.get(rawService.uuid);
                    if (!service) {
                        service = new Service_1.Service(this.noble, this, rawService.uuid, this.gatt);
                        this.services.set(rawService.uuid, service);
                    }
                }
                resolve([...this.services.values()]);
            };
            this.gatt.on('includedServicesDiscovered', done);
            this.gatt.discoverIncludedServices(baseService.uuid, serviceUUIDs || []);
        });
    }
}
exports.Peripheral = Peripheral;
//# sourceMappingURL=Peripheral.js.map