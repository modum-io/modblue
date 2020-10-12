"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GattCharacteristic = void 0;
const events_1 = require("events");
class GattCharacteristic extends events_1.EventEmitter {
    constructor(service, uuid, properties) {
        super();
        this.service = service;
        this.uuid = uuid;
        this.properties = properties;
    }
    toString() {
        return JSON.stringify({
            serviceUUID: this.service.uuid,
            uuid: this.uuid,
            properties: this.properties
        });
    }
}
exports.GattCharacteristic = GattCharacteristic;
//# sourceMappingURL=Characteristic.js.map