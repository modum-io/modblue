var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Gatt } from '../../../models';
import { buildTypedValue, I_BLUEZ_CHARACTERISTIC, I_BLUEZ_DEVICE, I_BLUEZ_SERVICE, I_OBJECT_MANAGER, I_PROPERTIES } from '../misc';
import { DbusGattCharacteristic } from './Characteristic';
import { DbusGattService } from './Service';
const DISCOVER_TIMEOUT = 10; // in seconds
export class DbusGatt extends Gatt {
    constructor(peripheral) {
        super(peripheral);
        this.services = new Map();
    }
    doDiscoverServices() {
        return __awaiter(this, void 0, void 0, function* () {
            const path = this.peripheral.path;
            const dbus = this.peripheral.adapter.modblue.dbus;
            const obj = yield dbus.getProxyObject('org.bluez', path);
            const propsIface = obj.getInterface(I_PROPERTIES);
            const servicesResolved = (yield propsIface.Get(I_BLUEZ_DEVICE, 'ServicesResolved')).value;
            if (!servicesResolved) {
                const timeoutError = new Error('Discovering timed out');
                yield new Promise((res, rej) => {
                    let timeout;
                    const onPropertiesChanged = (iface, changedProps) => {
                        if (iface !== I_BLUEZ_DEVICE) {
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
            const objManager = yield dbus.getProxyObject(`org.bluez`, '/');
            const objManagerIface = objManager.getInterface(I_OBJECT_MANAGER);
            const objs = yield objManagerIface.GetManagedObjects();
            const keys = Object.keys(objs);
            for (const srvPath of keys) {
                if (!srvPath.startsWith(path)) {
                    continue;
                }
                const srvObj = objs[srvPath][I_BLUEZ_SERVICE];
                if (!srvObj) {
                    continue;
                }
                let service = this.services.get(srvPath);
                if (!service) {
                    const uuid = srvObj.UUID.value.replace(/-/g, '');
                    service = new DbusGattService(this, srvPath, true, uuid);
                    this.services.set(uuid, service);
                }
            }
            return [...this.services.values()];
        });
    }
    discoverCharacteristics(serviceUUID) {
        return __awaiter(this, void 0, void 0, function* () {
            const service = this.services.get(serviceUUID);
            if (!service) {
                throw new Error(`Service ${serviceUUID} not found`);
            }
            const objManager = yield this.peripheral.adapter.modblue.dbus.getProxyObject(`org.bluez`, '/');
            const objManagerIface = objManager.getInterface(I_OBJECT_MANAGER);
            const objs = yield objManagerIface.GetManagedObjects();
            const keys = Object.keys(objs);
            const characteristics = [];
            for (const charPath of keys) {
                if (!charPath.startsWith(service.path)) {
                    continue;
                }
                const charObj = objs[charPath][I_BLUEZ_CHARACTERISTIC];
                if (!charObj) {
                    continue;
                }
                const uuid = charObj.UUID.value.replace(/-/g, '');
                const properties = charObj.Flags.value.filter((p) => !p.startsWith('secure-'));
                const secure = properties.filter((p) => p.startsWith('encrypt')).map((p) => p.replace('encrypt-', ''));
                const characteristic = new DbusGattCharacteristic(service, uuid, true, properties, secure, charPath);
                characteristics.push(characteristic);
            }
            return characteristics;
        });
    }
    readCharacteristic(serviceUUID, characteristicUUID) {
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
            const iface = obj.getInterface(I_BLUEZ_CHARACTERISTIC);
            return iface.ReadValue({
                offset: buildTypedValue('uint16', 0)
            });
        });
    }
    writeCharacteristic(serviceUUID, characteristicUUID, data, withoutResponse) {
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
            const iface = obj.getInterface(I_BLUEZ_CHARACTERISTIC);
            yield iface.WriteValue([...data], {
                offset: buildTypedValue('uint16', 0),
                type: buildTypedValue('string', withoutResponse ? 'command' : 'request')
            });
        });
    }
    broadcastCharacteristic() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Method not implemented.');
        });
    }
    notifyCharacteristic() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Method not implemented.');
        });
    }
    discoverDescriptors() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Method not implemented.');
        });
    }
    readDescriptor() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Method not implemented.');
        });
    }
    writeDescriptor() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Method not implemented.');
        });
    }
}
//# sourceMappingURL=Gatt.js.map