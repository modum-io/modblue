"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Service = void 0;
const events_1 = require("events");
const knownServices = require('./data/services.json');
class Service extends events_1.EventEmitter {
    constructor(noble, peripheralUUID, uuid) {
        super();
        this.noble = noble;
        this.peripheralUUID = peripheralUUID;
        this.uuid = uuid;
        this.name = null;
        this.type = null;
        this.includedServiceUUIDs = [];
        this.characteristics = new Map();
        const service = knownServices[uuid];
        if (service) {
            this.name = service.name;
            this.type = service.type;
        }
    }
    toString() {
        return JSON.stringify({
            uuid: this.uuid,
            name: this.name,
            type: this.type,
            includedServiceUUIDs: this.includedServiceUUIDs
        });
    }
    async discoverIncludedServices(serviceUUIDs) {
        this.noble.discoverIncludedServices(this.peripheralUUID, this.uuid, serviceUUIDs);
        return new Promise((resolve) => this.once('includedServicesDiscover', (includedServiceUUIDs) => resolve(includedServiceUUIDs)));
    }
    async discoverCharacteristics(characteristicUUIDs) {
        this.noble.discoverCharacteristics(this.peripheralUUID, this.uuid, characteristicUUIDs);
        return new Promise((resolve) => this.once('characteristicsDiscover', (characteristics) => resolve(characteristics)));
    }
}
exports.Service = Service;
//# sourceMappingURL=Service.js.map