"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbusGatt = void 0;
const models_1 = require("../../../models");
const misc_1 = require("../misc");
const Service_1 = require("./Service");
const DISCOVER_TIMEOUT = 10; // in seconds
class DbusGatt extends models_1.Gatt {
    constructor(peripheral) {
        super(peripheral);
        this.services = new Map();
    }
    get dbus() {
        return this.peripheral.adapter.modblue.dbus;
    }
    discoverServices() {
        return __awaiter(this, void 0, void 0, function* () {
            const obj = yield this.dbus.getProxyObject('org.bluez', this.peripheral.path);
            const propsIface = obj.getInterface(misc_1.I_PROPERTIES);
            const servicesResolved = (yield propsIface.Get(misc_1.I_BLUEZ_DEVICE, 'ServicesResolved')).value;
            if (!servicesResolved) {
                const timeoutError = new Error('Discovering timed out');
                yield new Promise((res, rej) => {
                    let timeout;
                    const onPropertiesChanged = (iface, changedProps) => {
                        if (iface !== misc_1.I_BLUEZ_DEVICE) {
                            return;
                        }
                        if ('ServicesResolved' in changedProps && changedProps.ServicesResolved.value) {
                            propsIface.off('PropertiesChanged', onPropertiesChanged);
                            if (timeout) {
                                clearTimeout(timeout);
                                timeout = null;
                            }
                            res();
                        }
                    };
                    propsIface.on('PropertiesChanged', onPropertiesChanged);
                    timeout = setTimeout(() => {
                        propsIface.off('PropertiesChanged', onPropertiesChanged);
                        rej(timeoutError);
                    }, DISCOVER_TIMEOUT * 1000);
                });
            }
            const objManager = yield this.dbus.getProxyObject(`org.bluez`, '/');
            const objManagerIface = objManager.getInterface(misc_1.I_OBJECT_MANAGER);
            const objs = yield objManagerIface.GetManagedObjects();
            const keys = Object.keys(objs);
            this.services.clear();
            for (const srvPath of keys) {
                if (!srvPath.startsWith(this.peripheral.path)) {
                    continue;
                }
                const srvObj = objs[srvPath][misc_1.I_BLUEZ_SERVICE];
                if (!srvObj) {
                    continue;
                }
                const uuid = srvObj.UUID.value.replace(/-/g, '');
                const service = new Service_1.DbusGattService(this, srvPath, true, uuid);
                this.services.set(service.uuid, service);
            }
            return [...this.services.values()];
        });
    }
}
exports.DbusGatt = DbusGatt;
//# sourceMappingURL=Gatt.js.map