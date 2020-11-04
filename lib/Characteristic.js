"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Characteristic = void 0;
const events_1 = require("events");
class Characteristic extends events_1.EventEmitter {
    constructor(noble, service, uuid, properties) {
        super();
        this.noble = noble;
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
exports.Characteristic = Characteristic;
//# sourceMappingURL=Characteristic.js.map