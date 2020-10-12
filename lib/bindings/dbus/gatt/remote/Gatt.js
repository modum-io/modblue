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
    constructor(peripheral, busObject) {
        super(peripheral);
        this.services = new Map();
        this.busObject = busObject;
    }
    prop(propName) {
        return this.busObject.prop(misc_1.I_BLUEZ_DEVICE, propName);
    }
    async doDiscoverServices() {
        return new Promise(async (resolve, reject) => {
            let cancelled = false;
            const onTimeout = () => {
                cancelled = true;
                reject(new Error('Discovering timed out'));
            };
            const timeout = setTimeout(onTimeout, DISCOVER_TIMEOUT * 1000);
            const servicesResolved = await this.prop('ServicesResolved');
            if (!servicesResolved) {
                await new Promise(async (res) => {
                    const propertiesIface = await this.busObject.getPropertiesInterface();
                    const onPropertiesChanged = (iface, changedProps) => {
                        if (iface !== misc_1.I_BLUEZ_DEVICE) {
                            return;
                        }
                        if ('ServicesResolved' in changedProps && changedProps.ServicesResolved.value) {
                            propertiesIface.off('PropertiesChanged', onPropertiesChanged);
                            res();
                        }
                    };
                    propertiesIface.on('PropertiesChanged', onPropertiesChanged);
                });
            }
            if (cancelled) {
                // If we canceled by timeout then all the promises have already been rejected, so just return.
                return;
            }
            else {
                clearTimeout(timeout);
            }
            const serviceIds = await this.busObject.getChildrenNames();
            for (const serviceId of serviceIds) {
                let service = this.services.get(serviceId);
                if (!service) {
                    const busObject = this.busObject.getChild(serviceId);
                    const uuid = (await busObject.prop(misc_1.I_BLUEZ_SERVICE, 'UUID')).replace(/\-/g, '');
                    service = new Service_1.DbusGattServiceRemote(this, uuid, busObject);
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
        const characteristicNames = await service.busObject.getChildrenNames();
        const characteristics = [];
        for (const characteristicId of characteristicNames) {
            const busObject = service.busObject.getChild(characteristicId);
            const uuid = (await busObject.prop(misc_1.I_BLUEZ_CHARACTERISTIC, 'UUID')).replace(/\-/g, '');
            const properties = await busObject.prop(misc_1.I_BLUEZ_CHARACTERISTIC, 'Flags');
            const characteristic = new Characteristic_1.DbusGattCharacteristicRemote(service, uuid, properties, busObject);
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
        const options = {
            offset: misc_1.buildTypedValue('uint16', 0)
        };
        const payload = await characteristic.busObject.callMethod(misc_1.I_BLUEZ_CHARACTERISTIC, 'ReadValue', options);
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
        const options = {
            offset: misc_1.buildTypedValue('uint16', 0),
            type: misc_1.buildTypedValue('string', withoutResponse ? 'command' : 'request')
        };
        await characteristic.busObject.callMethod(misc_1.I_BLUEZ_CHARACTERISTIC, 'WriteValue', [...data], options);
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