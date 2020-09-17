"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Peripheral = void 0;
const Peripheral_1 = require("../../Peripheral");
const gatt_1 = require("./gatt");
const Service_1 = require("./Service");
const signaling_1 = require("./signaling");
class Peripheral extends Peripheral_1.BasePeripheral {
    constructor() {
        super(...arguments);
        this.services = new Map();
        this.onConnectionParameterUpdateRequest = (minInterval, maxInterval, latency, supervisionTimeout) => {
            this.hci.connUpdateLe(this.handle, minInterval, maxInterval, latency, supervisionTimeout);
        };
    }
    getDiscoveredServices() {
        return [...this.services.values()];
    }
    async connect(requestMtu) {
        this._state = 'connecting';
        this.requestedMTU = requestMtu;
        await this.adapter.connect(this);
    }
    async onConnect(hci, handle) {
        this.handle = handle;
        this.hci = hci;
        this.gatt = new gatt_1.Gatt(this.hci, this.handle);
        this.signaling = new signaling_1.Signaling(this.hci, this.handle);
        this.signaling.on('connectionParameterUpdateRequest', this.onConnectionParameterUpdateRequest);
        const wantedMtu = this.requestedMTU || 256;
        const mtu = await this.gatt.exchangeMtu(wantedMtu);
        this._state = 'connected';
        this._mtu = mtu;
    }
    async disconnect() {
        this._state = 'disconnecting';
        return this.adapter.disconnect(this);
    }
    onDisconnect() {
        this.gatt.dispose();
        this.gatt = null;
        this.signaling.off('connectionParameterUpdateRequest', this.onConnectionParameterUpdateRequest);
        this.signaling = null;
        this.hci = null;
        this.handle = null;
        this._state = 'disconnected';
        this._mtu = undefined;
    }
    async discoverServices(serviceUUIDs) {
        const services = await this.gatt.discoverServices(serviceUUIDs || []);
        for (const rawService of services) {
            let service = this.services.get(rawService.uuid);
            if (!service) {
                service = new Service_1.Service(this.noble, this, rawService.uuid, this.gatt);
                this.services.set(rawService.uuid, service);
            }
        }
        return [...this.services.values()];
    }
    async discoverIncludedServices(baseService, serviceUUIDs) {
        const services = await this.gatt.discoverIncludedServices(baseService.uuid, serviceUUIDs);
        for (const rawService of services) {
            let service = this.services.get(rawService.uuid);
            if (!service) {
                service = new Service_1.Service(this.noble, this, rawService.uuid, this.gatt);
                this.services.set(rawService.uuid, service);
            }
        }
        return [...this.services.values()];
    }
}
exports.Peripheral = Peripheral;
//# sourceMappingURL=Peripheral.js.map