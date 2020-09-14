"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Peripheral = void 0;
const events_1 = require("events");
class Peripheral extends events_1.EventEmitter {
    constructor(noble, uuid, address, addressType, connectable, advertisement, rssi) {
        super();
        this.noble = noble;
        this.uuid = uuid;
        this.address = address;
        this.addressType = addressType;
        this.connectable = connectable;
        this.advertisement = advertisement;
        this.rssi = rssi;
        this.services = new Map();
        this.mtu = null;
        this.state = 'disconnected';
    }
    toString() {
        return JSON.stringify({
            uuid: this.uuid,
            address: this.address,
            addressType: this.addressType,
            connectable: this.connectable,
            advertisement: this.advertisement,
            rssi: this.rssi,
            mtu: this.mtu,
            state: this.state
        });
    }
    async connect(requestMtu) {
        if (this.state === 'connected') {
            this.emit('connect');
        }
        else {
            this.state = 'connecting';
            this.noble.connect(this.uuid, requestMtu);
        }
        return new Promise((resolve, reject) => this.once('connect', (error) => (error ? reject(error) : resolve())));
    }
    async disconnect() {
        this.state = 'disconnecting';
        this.noble.disconnect(this.uuid);
        return new Promise((resolve) => this.once('disconnect', (reason) => resolve(reason)));
    }
    async updateRSSI() {
        this.noble.updateRSSI(this.uuid);
        return new Promise((resolve) => this.once('rssiUpdate', (rssi) => resolve(rssi)));
    }
    async discoverServices(uuids) {
        this.noble.discoverServices(this.uuid, uuids);
        return new Promise((resolve) => this.once('servicesDiscover', (services) => resolve(services)));
    }
    async discoverSomeServicesAndCharacteristics(serviceUUIDs, characteristicsUUIDs) {
        const services = await this.discoverServices(serviceUUIDs);
        if (serviceUUIDs.some((serviceUUID) => !services.has(serviceUUID))) {
            throw new Error('Could not find all requested services');
        }
        let allCharacteristics = [];
        for (const service of services.values()) {
            try {
                const characteristics = await service.discoverCharacteristics(characteristicsUUIDs);
                allCharacteristics = allCharacteristics.concat([...characteristics.values()]);
            }
            catch (_a) {
                // The characteristics might be inside another service
                // TODO: Handle not finding all characteristics
            }
        }
        return [[...services.values()], allCharacteristics];
    }
    async discoverAllServicesAndCharacteristics() {
        return this.discoverSomeServicesAndCharacteristics([], []);
    }
    async readHandle(handle) {
        this.noble.readHandle(this.uuid, handle);
        return new Promise((resolve) => this.once(`handleRead${handle}`, (data) => resolve(data)));
    }
    async writeHandle(handle, data, withoutResponse) {
        this.noble.writeHandle(this.uuid, handle, data, withoutResponse);
        return new Promise((resolve) => this.once(`handleWrite${handle}`, () => resolve()));
    }
}
exports.Peripheral = Peripheral;
//# sourceMappingURL=Peripheral.js.map