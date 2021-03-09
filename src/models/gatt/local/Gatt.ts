import { Adapter } from '../../Adapter';
import { GattCharacteristicProperty } from '../Characteristic';
import { Gatt } from '../Gatt';

import { GattCharacteristicLocal, ReadFunction, WriteFunction } from './Characteristic';
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
	value: number;
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
	secure: GattCharacteristicProperty[];
	value?: Buffer;
	onRead?: ReadFunction;
	onWrite?: WriteFunction;
	descriptors?: GattDescriptorInput[];
}

export interface GattDescriptorInput {
	uuid: string;
	value: Buffer;
}

export abstract class GattLocal extends Gatt {
	public readonly adapter: Adapter;

	protected handles: Handle[];

	protected _maxMtu: number;
	public get maxMtu(): number {
		return this._maxMtu;
	}

	protected _deviceName: string;
	public get deviceName(): string {
		return this._deviceName;
	}

	protected _serviceInputs: GattServiceInput[];
	public get serviceInputs(): GattServiceInput[] {
		return this._serviceInputs;
	}

	public constructor(adapter: Adapter, maxMtu = 256) {
		super();

		this.adapter = adapter;
		this._maxMtu = maxMtu;
		this.handles = [];
	}

	public setData(deviceName: string, services: GattServiceInput[]): void {
		const handles: Handle[] = [];

		this._deviceName = deviceName;
		this._serviceInputs = services;

		const baseServices: GattServiceInput[] = [
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
			const newChars: GattCharacteristicLocal[] = [];
			const newService = new GattServiceLocal(this, service.uuid, newChars);

			const serviceStartHandle = handle++;
			const serviceHandle: ServiceHandle = {
				type: 'service',
				start: serviceStartHandle,
				end: 0, // Determined below
				object: newService
			};
			handles[serviceStartHandle] = serviceHandle;

			for (const char of service.characteristics) {
				const newDescriptors: GattDescriptorLocal[] = [];

				if (char.properties.includes('read') && !char.value && !char.onRead) {
					throw new Error(
						`Characteristic ${char.uuid} has the 'read' property and needs either a value or an 'onRead' function`
					);
				}

				const onRead: ReadFunction = char.onRead
					? char.onRead
					: async (offset: number) => [0, char.value.slice(offset)];

				if (
					(char.properties.includes('write') || char.properties.includes('write-without-response')) &&
					!char.onWrite
				) {
					throw new Error(
						`Characteristic ${char.uuid} has the 'write' or 'write-without-response' property and needs an 'onWrite' function`
					);
				}

				const onWrite: WriteFunction = char.onWrite;

				const newChar = new GattCharacteristicLocal(
					newService,
					char.uuid,
					char.properties,
					char.secure,
					onRead,
					onWrite,
					newDescriptors
				);

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

				if (char.properties.includes('indicate') || char.properties.includes('notify')) {
					// notify or indicate: add client characteristic configuration descriptor
					const newDescr = new GattDescriptorLocal(newChar, '2902', Buffer.from([0x00, 0x00]));

					const clientCharacteristicConfigurationDescriptorHandle = handle++;
					handles[clientCharacteristicConfigurationDescriptorHandle] = {
						type: 'descriptor',
						object: newDescr,
						value: clientCharacteristicConfigurationDescriptorHandle
					};
				}

				if (char.descriptors) {
					for (const descr of char.descriptors) {
						const newDescr = new GattDescriptorLocal(newChar, descr.uuid, descr.value);

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

	public toJSON(): Record<string, unknown> {
		return {
			...super.toJSON(),
			maxMtu: this.maxMtu,
			adapter: this.adapter
		};
	}
}
