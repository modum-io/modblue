"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GattLocal = void 0;
const Gatt_1 = require("../Gatt");
const Characteristic_1 = require("./Characteristic");
const Descriptor_1 = require("./Descriptor");
const Service_1 = require("./Service");
class GattLocal extends Gatt_1.Gatt {
    constructor(adapter, maxMtu = 256) {
        super();
        this.adapter = adapter;
        this._maxMtu = maxMtu;
        this.handles = [];
    }
    get maxMtu() {
        return this._maxMtu;
    }
    get deviceName() {
        return this._deviceName;
    }
    get serviceInputs() {
        return this._serviceInputs;
    }
    toString() {
        return JSON.stringify({
            mtu: this.maxMtu,
            adapterId: this.adapter.id
        });
    }
    setData(deviceName, services) {
        const handles = [];
        this._deviceName = deviceName;
        this._serviceInputs = services;
        const baseServices = [
            {
                uuid: '1800',
                characteristics: [
                    {
                        uuid: '2a00',
                        properties: ['read'],
                        secure: [],
                        value: Buffer.from(deviceName)
                    },
                    {
                        uuid: '2a01',
                        properties: ['read'],
                        secure: [],
                        value: Buffer.from([0x80, 0x00])
                    }
                ]
            },
            {
                uuid: '1801',
                characteristics: [
                    {
                        uuid: '2a05',
                        properties: ['indicate'],
                        secure: [],
                        value: Buffer.from([0x00, 0x00, 0x00, 0x00])
                    }
                ]
            }
        ];
        const allServices = baseServices.concat(services);
        let handle = 1;
        for (const service of allServices) {
            const newChars = [];
            const newService = new Service_1.GattServiceLocal(this, service.uuid, newChars);
            const serviceStartHandle = handle++;
            const serviceHandle = {
                type: 'service',
                start: serviceStartHandle,
                end: 0,
                object: newService
            };
            handles[serviceStartHandle] = serviceHandle;
            for (const char of service.characteristics) {
                const newDescriptors = [];
                if (char.properties.includes('read') && !char.value && !char.onRead) {
                    throw new Error(`Characteristic ${char.uuid} has the 'read' property and needs either a value or an 'onRead' function`);
                }
                const onRead = char.onRead
                    ? char.onRead
                    : async (offset) => [0, char.value.slice(offset)];
                if ((char.properties.includes('write') || char.properties.includes('write-without-response')) &&
                    !char.onWrite) {
                    throw new Error(`Characteristic ${char.uuid} has the 'write' or 'write-without-response' property and needs an 'onWrite' function`);
                }
                const onWrite = char.onWrite;
                const newChar = new Characteristic_1.GattCharacteristicLocal(newService, char.uuid, char.properties, char.secure, onRead, onWrite, newDescriptors);
                const charStartHandle = handle++;
                const charValueHandle = handle++;
                handles[charStartHandle] = {
                    type: 'characteristic',
                    start: charStartHandle,
                    value: charValueHandle,
                    object: newChar
                };
                handles[charValueHandle] = {
                    type: 'characteristicValue',
                    start: charStartHandle,
                    value: charValueHandle,
                    object: newChar
                };
                if (char.descriptors) {
                    for (const descr of char.descriptors) {
                        const newDescr = new Descriptor_1.GattDescriptorLocal(newChar, descr.uuid, descr.value);
                        const descrHandle = handle++;
                        handles[descrHandle] = { type: 'descriptor', value: descrHandle, object: newDescr };
                        newDescriptors.push(newDescr);
                    }
                }
                newChars.push(newChar);
            }
            // Set end handle
            serviceHandle.end = handle - 1;
        }
        this.handles = handles;
    }
}
exports.GattLocal = GattLocal;
//# sourceMappingURL=Gatt.js.map