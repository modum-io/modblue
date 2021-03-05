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
    doDiscoverServices() {
        return __awaiter(this, void 0, void 0, function* () {
            const path = this.peripheral.path;
            const dbus = this.peripheral.adapter.modblue.dbus;
            const timeoutError = new Error('Discovering timed out');
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let cancelled = false;
                const onTimeout = () => {
                    cancelled = true;
                    reject(timeoutError);
                };
                const timeout = setTimeout(onTimeout, DISCOVER_TIMEOUT * 1000);
                const obj = yield dbus.getProxyObject('org.bluez', path);
                const propsIface = obj.getInterface(misc_1.I_PROPERTIES);
                const servicesResolved = (yield propsIface.Get(misc_1.I_BLUEZ_DEVICE, 'ServicesResolved')).value;
                if (!servicesResolved) {
                    yield new Promise((res) => __awaiter(this, void 0, void 0, function* () {
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
                    }));
                }
                if (cancelled) {
                    // If we canceled by timeout then all the promises have already been rejected, so just return.
                    return;
                }
                else {
                    clearTimeout(timeout);
                }
                const objManager = yield dbus.getProxyObject(`org.bluez`, '/');
                const objManagerIface = objManager.getInterface(misc_1.I_OBJECT_MANAGER);
                const objs = yield objManagerIface.GetManagedObjects();
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
            }));
        });
    }
    discoverCharacteristics(serviceUUID) {
        return __awaiter(this, void 0, void 0, function* () {
            const service = this.services.get(serviceUUID);
            if (!service) {
                throw new Error(`Service ${serviceUUID} not found`);
            }
            const objManager = yield this.peripheral.adapter.modblue.dbus.getProxyObject(`org.bluez`, '/');
            const objManagerIface = objManager.getInterface(misc_1.I_OBJECT_MANAGER);
            const objs = yield objManagerIface.GetManagedObjects();
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
        });
    }
    read(serviceUUID, characteristicUUID) {
        return __awaiter(this, void 0, void 0, function* () {
            const service = this.services.get(serviceUUID);
            if (!service) {
                throw new Error(`Service ${serviceUUID} not found`);
            }
            const characteristic = service.characteristics.get(characteristicUUID);
            if (!characteristic) {
                throw new Error(`Characteristic ${characteristicUUID} in service ${serviceUUID} not found`);
            }
            const obj = yield this.peripheral.adapter.modblue.dbus.getProxyObject('org.bluez', characteristic.path);
            const iface = obj.getInterface(misc_1.I_BLUEZ_CHARACTERISTIC);
            return iface.ReadValue({
                offset: misc_1.buildTypedValue('uint16', 0)
            });
        });
    }
    write(serviceUUID, characteristicUUID, data, withoutResponse) {
        return __awaiter(this, void 0, void 0, function* () {
            const service = this.services.get(serviceUUID);
            if (!service) {
                throw new Error(`Service ${serviceUUID} not found`);
            }
            const characteristic = service.characteristics.get(characteristicUUID);
            if (!characteristic) {
                throw new Error(`Characteristic ${characteristicUUID} in service ${serviceUUID} not found`);
            }
            const obj = yield this.peripheral.adapter.modblue.dbus.getProxyObject('org.bluez', characteristic.path);
            const iface = obj.getInterface(misc_1.I_BLUEZ_CHARACTERISTIC);
            yield iface.WriteValue([...data], {
                offset: misc_1.buildTypedValue('uint16', 0),
                type: misc_1.buildTypedValue('string', withoutResponse ? 'command' : 'request')
            });
        });
    }
    broadcast(serviceUUID, characteristicUUID, broadcast) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Method not implemented.');
        });
    }
    notify(serviceUUID, characteristicUUID, notify) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Method not implemented.');
        });
    }
    discoverDescriptors(serviceUUID, characteristicUUID) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Method not implemented.');
        });
    }
    readValue(serviceUUID, characteristicUUID, descriptorUUID) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Method not implemented.');
        });
    }
    writeValue(serviceUUID, characteristicUUID, descriptorUUID, data) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Method not implemented.');
        });
    }
}
exports.DbusGattRemote = DbusGattRemote;
//# sourceMappingURL=Gatt.js.map