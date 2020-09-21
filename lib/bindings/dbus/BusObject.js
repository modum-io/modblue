"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusObject = exports.I_OBJECT_MANAGER = exports.I_PROPERTIES = exports.I_BLUEZ_CHARACTERISTIC = exports.I_BLUEZ_SERVICE = exports.I_BLUEZ_DEVICE = exports.I_BLUEZ_ADAPTER = void 0;
exports.I_BLUEZ_ADAPTER = 'org.bluez.Adapter1';
exports.I_BLUEZ_DEVICE = 'org.bluez.Device1';
exports.I_BLUEZ_SERVICE = 'org.bluez.GattService1';
exports.I_BLUEZ_CHARACTERISTIC = 'org.bluez.GattCharacteristic1';
exports.I_PROPERTIES = 'org.freedesktop.DBus.Properties';
exports.I_OBJECT_MANAGER = 'org.freedesktop.DBus.ObjectManager';
class BusObject {
    constructor(dbus, serviceName, objectName) {
        this.dbus = dbus;
        this.objectName = objectName;
        this.serviceName = serviceName;
    }
    async getObject(refresh) {
        if (refresh || !this._object) {
            this._object = await this.dbus.getProxyObject(this.serviceName, this.objectName);
        }
        return this._object;
    }
    getChild(childName) {
        return new BusObject(this.dbus, this.serviceName, `${this.objectName}/${childName}`);
    }
    async getChildrenNames() {
        const path = this.objectName === '/' ? '' : this.objectName;
        const object = await this.getObject(true);
        const children = new Set();
        for (const node of object.nodes) {
            if (!node.startsWith(path)) {
                continue;
            }
            const end = node.indexOf('/', path.length + 1);
            const sub = end >= 0 ? node.substring(path.length + 1, end) : node.substring(path.length + 1);
            if (sub.length < 1) {
                continue;
            }
            children.add(sub);
        }
        return [...children.values()];
    }
    async getInterface(interfaceName) {
        const object = await this.getObject();
        return object.getInterface(interfaceName);
    }
    async getPropertiesInterface() {
        return this.getInterface(exports.I_PROPERTIES);
    }
    async prop(interfaceName, propName) {
        const iface = await this.getPropertiesInterface();
        const rawProp = await iface.Get(interfaceName, propName);
        return rawProp.value;
    }
    async callMethod(interfaceName, methodName, ...args) {
        const object = await this.getObject();
        return object.getInterface(interfaceName)[methodName](...args);
    }
    async on(interfaceName, event, listener) {
        const object = await this.getObject();
        object.getInterface(interfaceName).on(event, listener);
    }
    async once(interfaceName, event, listener) {
        const object = await this.getObject();
        object.getInterface(interfaceName).once(event, listener);
    }
    async off(interfaceName, event, listener) {
        const object = await this.getObject();
        object.getInterface(interfaceName).off(event, listener);
    }
}
exports.BusObject = BusObject;
//# sourceMappingURL=BusObject.js.map