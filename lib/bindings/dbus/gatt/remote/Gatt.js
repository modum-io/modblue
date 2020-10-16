"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbusGattRemote = void 0;
const models_1 = require("../../../../models");
const misc_1 = require("../../misc");
const Characteristic_1 = require("./Characteristic");
const Service_1 = require("./Service");
// tslint:disable: promise-must-complete
const DISCOVER_TIMEOUT = 10; // in seconds
class DbusGattRemote extends models_1.GattRemote {
    constructor(peripheral) {
        super(peripheral);
        this.services = new Map();
    }
    async doDiscoverServices() {
        const path = this.peripheral.path;
        const dbus = this.peripheral.adapter.noble.dbus;
        return new Promise(async (resolve, reject) => {
            let cancelled = false;
            const onTimeout = () => {
                cancelled = true;
                reject(new Error('Discovering timed out'));
            };
            const timeout = setTimeout(onTimeout, DISCOVER_TIMEOUT * 1000);
            const obj = await dbus.getProxyObject('org.bluez', path);
            const propsIface = obj.getInterface(misc_1.I_PROPERTIES);
            const servicesResolved = (await propsIface.Get(misc_1.I_BLUEZ_DEVICE, 'ServicesResolved')).value;
            if (!servicesResolved) {
                await new Promise(async (res) => {
                    const onPropertiesChanged = (iface, changedProps) => {
                        if (iface !== misc_1.I_BLUEZ_DEVICE) {
                            return;
                        }
                        if ('ServicesResolved' in changedProps && changedProps.ServicesResolved.value) {
                            propsIface.off('PropertiesChanged', onPropertiesChanged);
                            res();
                        }
                    };
                    propsIface.on('PropertiesChanged', onPropertiesChanged);
                });
            }
            if (cancelled) {
                // If we canceled by timeout then all the promises have already been rejected, so just return.
                return;
            }
            else {
                clearTimeout(timeout);
            }
            const objManager = await dbus.getProxyObject(`org.bluez`, '/');
            const objManagerIface = objManager.getInterface(misc_1.I_OBJECT_MANAGER);
            const objs = await objManagerIface.GetManagedObjects();
            const keys = Object.keys(objs);
            for (const srvPath of keys) {
                if (!srvPath.startsWith(path)) {
                    continue;
                }
                const srvObj = objs[srvPath][misc_1.I_BLUEZ_SERVICE];
                if (!srvObj) {
                    continue;
                }
                let service = this.services.get(srvPath);
                if (!service) {
                    const uuid = srvObj.UUID.value.replace(/\-/g, '');
                    service = new Service_1.DbusGattServiceRemote(this, srvPath, uuid);
                    this.services.set(uuid, service);
                }
            }
            resolve([...this.services.values()]);
        });
    }
    async discoverCharacteristics(serviceUUID) {
        const service = this.services.get(serviceUUID);
        if (!service) {
            throw new Error(`Service ${serviceUUID} not found`);
        }
        const objManager = await this.peripheral.adapter.noble.dbus.getProxyObject(`org.bluez`, '/');
        const objManagerIface = objManager.getInterface(misc_1.I_OBJECT_MANAGER);
        const objs = await objManagerIface.GetManagedObjects();
        const keys = Object.keys(objs);
        const characteristics = [];
        for (const charPath of keys) {
            if (!charPath.startsWith(service.path)) {
                continue;
            }
            const charObj = objs[charPath][misc_1.I_BLUEZ_CHARACTERISTIC];
            if (!charObj) {
                continue;
            }
            const uuid = charObj.UUID.value.replace(/\-/g, '');
            const properties = charObj.Flags.value.filter((p) => !p.startsWith('secure-'));
            const secure = properties.filter((p) => p.startsWith('encrypt')).map((p) => p.replace('encrypt-', ''));
            const characteristic = new Characteristic_1.DbusGattCharacteristicRemote(service, charPath, uuid, properties, secure);
            characteristics.push(characteristic);
        }
        return characteristics;
    }
    async read(serviceUUID, characteristicUUID) {
        const service = this.services.get(serviceUUID);
        if (!service) {
            throw new Error(`Service ${serviceUUID} not found`);
        }
        const characteristic = service.characteristics.get(characteristicUUID);
        if (!characteristic) {
            throw new Error(`Characteristic ${characteristicUUID} in service ${serviceUUID} not found`);
        }
        const obj = await this.peripheral.adapter.noble.dbus.getProxyObject('org.bluez', characteristic.path);
        const iface = obj.getInterface(misc_1.I_BLUEZ_CHARACTERISTIC);
        const payload = await iface.ReadValue({
            offset: misc_1.buildTypedValue('uint16', 0)
        });
        console.log(payload);
        return Buffer.from(payload);
    }
    async write(serviceUUID, characteristicUUID, data, withoutResponse) {
        const service = this.services.get(serviceUUID);
        if (!service) {
            throw new Error(`Service ${serviceUUID} not found`);
        }
        const characteristic = service.characteristics.get(characteristicUUID);
        if (!characteristic) {
            throw new Error(`Characteristic ${characteristicUUID} in service ${serviceUUID} not found`);
        }
        const obj = await this.peripheral.adapter.noble.dbus.getProxyObject('org.bluez', characteristic.path);
        const iface = obj.getInterface(misc_1.I_BLUEZ_CHARACTERISTIC);
        await iface.WriteValue([...data], {
            offset: misc_1.buildTypedValue('uint16', 0),
            type: misc_1.buildTypedValue('string', withoutResponse ? 'command' : 'request')
        });
    }
    async broadcast(serviceUUID, characteristicUUID, broadcast) {
        throw new Error('Method not implemented.');
    }
    async notify(serviceUUID, characteristicUUID, notify) {
        throw new Error('Method not implemented.');
    }
    async discoverDescriptors(serviceUUID, characteristicUUID) {
        throw new Error('Method not implemented.');
    }
    async readValue(serviceUUID, characteristicUUID, descriptorUUID) {
        throw new Error('Method not implemented.');
    }
    async writeValue(serviceUUID, characteristicUUID, descriptorUUID, data) {
        throw new Error('Method not implemented.');
    }
}
exports.DbusGattRemote = DbusGattRemote;
//# sourceMappingURL=Gatt.js.map