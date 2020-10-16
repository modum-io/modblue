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
    async dispose() {
        this.adapters = new Map();
    }
    async getAdapters() {
        if (!this.objManagerIface) {
            const objManager = await this.dbus.getProxyObject('org.bluez', '/');
            this.objManagerIface = objManager.getInterface(misc_1.I_OBJECT_MANAGER);
        }
        const objs = await this.objManagerIface.GetManagedObjects();
        const keys = Object.keys(objs);
        for (const adapterPath of keys) {
            const adapterObj = objs[adapterPath][misc_1.I_BLUEZ_ADAPTER];
            if (!adapterObj) {
                continue;
            }
            let adapter = this.adapters.get(adapterPath);
            if (!adapter) {
                adapter = new Adapter_1.DbusAdapter(this, adapterPath, adapterObj.Name.value, adapterObj.Address.value);
                this.adapters.set(adapterPath, adapter);
            }
        }
        return [...this.adapters.values()];
    }
}
exports.DbusNoble = DbusNoble;
//# sourceMappingURL=Noble.js.map