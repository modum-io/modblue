"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Characteristic = void 0;
const events_1 = require("events");
const characteristics_json_1 = __importDefault(require("./data/characteristics.json"));
class Characteristic extends events_1.EventEmitter {
    constructor(noble, peripheralUUID, serviceUUID, uuid, properties) {
        super();
        this.noble = noble;
        this.peripheralUUID = peripheralUUID;
        this.serviceUUID = serviceUUID;
        this.uuid = uuid;
        this.name = null;
        this.type = null;
        this.properties = properties;
        this.descriptors = new Map();
        const characteristic = characteristics_json_1.default[uuid];
        if (characteristic) {
            this.name = characteristic.name;
            this.type = characteristic.type;
        }
    }
    toString() {
        return JSON.stringify({
            uuid: this.uuid,
            name: this.name,
            type: this.type,
            properties: this.properties
        });
    }
    async read() {
        this.noble.read(this.peripheralUUID, this.serviceUUID, this.uuid);
        return new Promise((resolve) => {
            const onRead = (data, isNotification) => {
                // only call the callback if 'read' event and non-notification
                // 'read' for non-notifications is only present for backwards compatbility
                if (!isNotification) {
                    // remove the listener
                    this.removeListener('read', onRead);
                    resolve(data);
                }
            };
            this.on('read', onRead);
        });
    }
    async write(data, withoutResponse) {
        this.noble.write(this.peripheralUUID, this.serviceUUID, this.uuid, data, withoutResponse);
        return new Promise((resolve) => this.once('write', () => resolve()));
    }
    async broadcast(broadcast) {
        this.noble.broadcast(this.peripheralUUID, this.serviceUUID, this.uuid, broadcast);
        return new Promise((resolve) => this.once('broadcast', () => resolve()));
    }
    // deprecated in favour of subscribe/unsubscribe
    async notify(notify) {
        this.noble.notify(this.peripheralUUID, this.serviceUUID, this.uuid, notify);
        return new Promise((resolve) => this.once('notify', () => resolve()));
    }
    async subscribe() {
        await this.notify(true);
    }
    async unsubscribe() {
        await this.notify(false);
    }
    async discoverDescriptors() {
        this.noble.discoverDescriptors(this.peripheralUUID, this.serviceUUID, this.uuid);
        return new Promise((resolve) => this.once('descriptorsDiscover', (descriptors) => resolve(descriptors)));
    }
}
exports.Characteristic = Characteristic;
//# sourceMappingURL=Characteristic.js.map