"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbusNoble = void 0;
const dbus_next_1 = require("dbus-next");
const models_1 = require("../../models");
const Adapter_1 = require("./Adapter");
const misc_1 = require("./misc");
class DbusNoble extends models_1.Noble {
    constructor() {
        super();
        this.adapters = new Map();
        this.dbus = dbus_next_1.systemBus();
    }
    async init() {
        this.bluezObject = new misc_1.BusObject(this.dbus, 'org.bluez', '/org/bluez');
    }
    async dispose() {
        this.adapters = new Map();
    }
    async getAdapters() {
        const adapterIds = await this.bluezObject.getChildrenNames();
        for (const adapterId of adapterIds) {
            let adapter = this.adapters.get(adapterId);
            if (!adapter) {
                const busObject = this.bluezObject.getChild(adapterId);
                const name = await busObject.prop(misc_1.I_BLUEZ_ADAPTER, 'Name');
                const address = await busObject.prop(misc_1.I_BLUEZ_ADAPTER, 'Address');
                adapter = new Adapter_1.DbusAdapter(this, adapterId, name, address, busObject);
                this.adapters.set(adapterId, adapter);
            }
        }
        return [...this.adapters.values()];
    }
}
exports.DbusNoble = DbusNoble;
//# sourceMappingURL=Noble.js.map