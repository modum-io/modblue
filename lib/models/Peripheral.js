"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Peripheral = void 0;
class Peripheral {
    constructor(adapter, uuid, addressType, address, advertisement, rssi) {
        this.adapter = adapter;
        this.uuid = uuid;
        this.addressType = addressType;
        this.address = address;
        this.advertisement = advertisement;
        this.rssi = rssi;
        this._state = 'disconnected';
    }
    get state() {
        return this._state;
    }
    toString() {
        return JSON.stringify({
            uuid: this.uuid,
            address: this.address,
            addressType: this.addressType,
            advertisement: this.advertisement,
            rssi: this.rssi,
            state: this._state
        });
    }
}
exports.Peripheral = Peripheral;
//# sourceMappingURL=Peripheral.js.map