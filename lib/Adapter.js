"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseAdapter = void 0;
const events_1 = require("events");
class BaseAdapter extends events_1.EventEmitter {
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
    get addressType() {
        return this._addressType;
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
exports.BaseAdapter = BaseAdapter;
//# sourceMappingURL=Adapter.js.map