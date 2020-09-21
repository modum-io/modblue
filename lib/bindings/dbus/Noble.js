"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Noble = void 0;
const Noble_1 = require("../../Noble");
const Adapter_1 = require("./Adapter");
const BusObject_1 = require("./BusObject");
class Noble extends Noble_1.BaseNoble {
    constructor(dbus) {
        super();
        this.adapters = new Map();
        this.dbus = dbus;
    }
    async init() {
        this.bluezObject = new BusObject_1.BusObject(this.dbus, 'org.bluez', '/org/bluez');
    }
    async dispose() {
        this.adapters = new Map();
    }
    async getAdapters() {
        const adapterIds = await this.bluezObject.getChildrenNames();
        for (const adapterId of adapterIds) {
            let adapter = this.adapters.get(adapterId);
            if (!adapter) {
                const object = this.bluezObject.getChild(adapterId);
                const name = await object.prop(BusObject_1.I_BLUEZ_ADAPTER, 'Name');
                const address = await object.prop(BusObject_1.I_BLUEZ_ADAPTER, 'Address');
                adapter = new Adapter_1.Adapter(this, adapterId, name, address, object);
                this.adapters.set(adapterId, adapter);
            }
        }
        return [...this.adapters.values()];
    }
}
exports.Noble = Noble;
//# sourceMappingURL=Noble.js.map