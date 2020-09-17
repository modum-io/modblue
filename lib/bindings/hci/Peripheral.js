"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Peripheral = void 0;
const Peripheral_1 = require("../../Peripheral");
const acl_stream_1 = require("./acl-stream");
const gatt_1 = require("./gatt");
const Service_1 = require("./Service");
const signaling_1 = require("./signaling");
class Peripheral extends Peripheral_1.BasePeripheral {
    constructor() {
        super(...arguments);
        this.services = new Map();
        this.onEncryptChange = (handle, encrypt) => {
            if (handle !== this.handle) {
                return;
            }
            this.aclStream.pushEncrypt(encrypt);
        };
        this.onAclDataPkt = (handle, cid, data) => {
            if (handle !== this.handle) {
                return;
            }
            this.aclStream.push(cid, data);
        };
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
        this.hci.on('encryptChange', this.onEncryptChange);
        this.hci.on('aclDataPkt', this.onAclDataPkt);
        this.aclStream = new acl_stream_1.AclStream(hci, handle, hci.addressType, hci.address, this.addressType, this.address);
        this.gatt = new gatt_1.Gatt(this.aclStream);
        this.signaling = new signaling_1.Signaling(this.aclStream);
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
        this._state = 'disconnected';
        this._mtu = undefined;
        this.aclStream.push(null, null);
        this.aclStream = null;
        this.gatt.removeAllListeners();
        this.gatt = null;
        this.signaling.removeAllListeners();
        this.signaling = null;
        this.hci.off('encryptChange', this.onEncryptChange);
        this.hci.off('aclDataPkt', this.onAclDataPkt);
        this.hci = null;
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