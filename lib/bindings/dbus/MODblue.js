var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { systemBus } from 'dbus-next';
import { MODblue } from '../../models';
import { DbusAdapter } from './Adapter';
import { I_BLUEZ_ADAPTER, I_OBJECT_MANAGER } from './misc';
/**
 * Use the DBUS Bluez bindings to access BLE functions.
 */
export class DbusMODblue extends MODblue {
    constructor() {
        super();
        this.adapters = new Map();
        this.dbus = systemBus();
    }
    dispose() {
        return __awaiter(this, void 0, void 0, function* () {
            this.adapters = new Map();
        });
    }
    getAdapters() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.objManagerIface) {
                const objManager = yield this.dbus.getProxyObject('org.bluez', '/');
                this.objManagerIface = objManager.getInterface(I_OBJECT_MANAGER);
            }
            const objs = yield this.objManagerIface.GetManagedObjects();
            const keys = Object.keys(objs);
            for (const adapterPath of keys) {
                const adapterObj = objs[adapterPath][I_BLUEZ_ADAPTER];
                if (!adapterObj) {
                    continue;
                }
                let adapter = this.adapters.get(adapterPath);
                if (!adapter) {
                    adapter = new DbusAdapter(this, adapterPath, adapterObj.Name.value, adapterObj.Address.value);
                    this.adapters.set(adapterPath, adapter);
                }
            }
            return [...this.adapters.values()];
        });
    }
}
//# sourceMappingURL=MODblue.js.map