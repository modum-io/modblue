"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Peripheral = void 0;
class Peripheral {
    constructor(noble, adapter, uuid, address, addressType, connectable, advertisement, rssi) {
        this.noble = noble;
        this.adapter = adapter;
        this.uuid = uuid;
        this.address = address;
        this.addressType = addressType;
        this.connectable = connectable;
        this.advertisement = advertisement;
        this.rssi = rssi;
        this._state = 'disconnected';
        this._mtu = null;
    }
    get state() {
        return this._state;
    }
    get mtu() {
        return this._mtu;
    }
    toString() {
        return JSON.stringify({
            uuid: this.uuid,
            address: this.address,
            addressType: this.addressType,
            connectable: this.connectable,
            advertisement: this.advertisement,
            rssi: this.rssi,
            state: this._state,
            mtu: this._mtu
        });
    }
}
exports.Peripheral = Peripheral;
//# sourceMappingURL=Peripheral.js.map