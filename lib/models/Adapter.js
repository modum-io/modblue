"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Adapter = void 0;
const events_1 = require("events");
class Adapter extends events_1.EventEmitter {
    constructor(noble, id, name, address) {
        super();
        this.noble = noble;
        this.id = id;
        this._name = name || `hci${id.replace('hci', '')}`;
        this._address = address;
    }
    get name() {
        return this._name;
    }
    get address() {
        return this._address;
    }
    toString() {
        return JSON.stringify({
            id: this.id,
            name: this.name,
            address: this.address
        });
    }
}
exports.Adapter = Adapter;
//# sourceMappingURL=Adapter.js.map