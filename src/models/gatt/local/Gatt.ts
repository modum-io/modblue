import { Adapter } from '../../Adapter';
import { GattCharacteristicProperty } from '../Characteristic';
import { Gatt } from '../Gatt';

import { GattCharacteristicLocal } from './Characteristic';
import { GattDescriptorLocal } from './Descriptor';
import { GattServiceLocal } from './Service';

interface ServiceHandle {
	type: 'service';
	start: number;
	end: number;
	object: GattServiceLocal;
}
interface CharacteristicHandle {
	type: 'characteristic' | 'characteristicValue';
	start: number;
	object: GattCharacteristicLocal;
}
interface DescriptorHandle {
	type: 'descriptor';
	value: number;
	object: GattDescriptorLocal;
}

type Handle = ServiceHandle | CharacteristicHandle | DescriptorHandle;

export interface GattServiceInput {
	uuid: string;
	characteristics: GattCharacteristicInput[];
}

export interface GattCharacteristicInput {
	uuid: string;
	properties: GattCharacteristicProperty[];
	value?: Buffer;
	descriptors?: GattDescriptorInput[];
}

export interface GattDescriptorInput {
	uuid: string;
	value: Buffer;
}

export abstract class GattLocal extends Gatt {
	public readonly adapter: Adapter;

	protected handles: Map<number, Handle>;

	public constructor(adapter: Adapter) {
		super();

		this.adapter = adapter;

		this.handles = new Map();
	}

	public toString() {
		return JSON.stringify({
			mtu: this.mtu,
			adapterId: this.adapter.id
		});
	}

	public setData(deviceName: string, services: GattServiceInput[]): void {
		const handles: Map<number, Handle> = new Map();

		const baseServices: GattServiceInput[] = [
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
			const newChars: GattCharacteristicLocal[] = [];
			const newService = new GattServiceLocal(this, service.uuid, newChars);

			const serviceStartHandle = handle++;

			for (const char of service.characteristics) {
				const newDescriptors: GattDescriptorLocal[] = [];
				const newChar = new GattCharacteristicLocal(newService, char.uuid, char.properties, newDescriptors);

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
						const newDescr = new GattDescriptorLocal(newChar, descr.uuid, descr.value);

						const descrHandle = handle++;
						handles.set(descrHandle, { type: 'descriptor', value: descrHandle, object: newDescr });

						newDescriptors.push(newDescr);
					}
				}

				newChars.push(newChar);
			}

			const serviceEndHandle = handle;
			handles.set(serviceStartHandle, {
				type: 'service',
				start: serviceStartHandle,
				end: serviceEndHandle,
				object: newService
			});
		}

		console.log(handles);

		this.handles = handles;
	}
}
