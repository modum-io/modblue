'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.GattLocal = void 0;
const Gatt_1 = require('../Gatt');
const Characteristic_1 = require('./Characteristic');
const Descriptor_1 = require('./Descriptor');
const Service_1 = require('./Service');
class GattLocal extends Gatt_1.Gatt {
	constructor(adapter) {
		super();
		this.adapter = adapter;
		this.handles = new Map();
	}
	get deviceName() {
		return this._deviceName;
	}
	toString() {
		return JSON.stringify({
			mtu: this.mtu,
			adapterId: this.adapter.id
		});
	}
	setData(deviceName, services) {
		const handles = new Map();
		this._deviceName = deviceName;
		const baseServices = [
			{
				uuid: '1800',
				characteristics: [
					{
						uuid: '2a00',
						properties: ['read'],
						value: Buffer.from(deviceName)
					},
					{
						uuid: '2a01',
						properties: ['read'],
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
						value: Buffer.from([0x00, 0x00, 0x00, 0x00])
					}
				]
			}
		];
		const allServices = baseServices.concat(services);
		let handle = 0;
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
			handles.set(serviceStartHandle, serviceHandle);
			for (const char of service.characteristics) {
				const newDescriptors = [];
				const newChar = new Characteristic_1.GattCharacteristicLocal(
					newService,
					char.uuid,
					char.properties,
					newDescriptors
				);
				const charStartHandle = handle++;
				handles.set(charStartHandle, {
					type: 'characteristic',
					start: charStartHandle,
					object: newChar
				});
				if (char.value) {
					const charValueHandle = handle++;
					handles.set(charValueHandle, {
						type: 'characteristicValue',
						start: charValueHandle,
						object: newChar
					});
				}
				if (char.descriptors) {
					for (const descr of char.descriptors) {
						const newDescr = new Descriptor_1.GattDescriptorLocal(newChar, descr.uuid, descr.value);
						const descrHandle = handle++;
						handles.set(descrHandle, { type: 'descriptor', value: descrHandle, object: newDescr });
						newDescriptors.push(newDescr);
					}
				}
				newChars.push(newChar);
			}
			// Set end handle
			serviceHandle.end = handle;
		}
		console.log(handles);
		this.handles = handles;
	}
}
exports.GattLocal = GattLocal;
//# sourceMappingURL=Gatt.js.map
