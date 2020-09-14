"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Descriptor = void 0;
const events_1 = require("events");
const descriptors_json_1 = __importDefault(require("./data/descriptors.json"));
class Descriptor extends events_1.EventEmitter {
    constructor(noble, peripheralUUID, serviceUUID, characteristicUUID, uuid) {
        super();
        this.noble = noble;
        this.peripheralUUID = peripheralUUID;
        this.serviceUUID = serviceUUID;
        this.characteristicUUID = characteristicUUID;
        this.uuid = uuid;
        this.name = null;
        this.type = null;
        const descriptor = descriptors_json_1.default[uuid];
        if (descriptor) {
            this.name = descriptor.name;
            this.type = descriptor.type;
        }
    }
    toString() {
        return JSON.stringify({
            uuid: this.uuid,
            name: this.name,
            type: this.type
        });
    }
    async readValue() {
        this.noble.readValue(this.peripheralUUID, this.serviceUUID, this.characteristicUUID, this.uuid);
        return new Promise((resolve) => this.once('valueRead', (data) => resolve(data)));
    }
    async writeValue(data) {
        this.noble.writeValue(this.peripheralUUID, this.serviceUUID, this.characteristicUUID, this.uuid, data);
        return new Promise((resolve) => this.once('valueWrite', () => resolve()));
    }
}
exports.Descriptor = Descriptor;
//# sourceMappingURL=Descriptor.js.map