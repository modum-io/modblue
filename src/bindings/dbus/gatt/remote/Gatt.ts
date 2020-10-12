import {
	GattCharacteristicProperty,
	GattCharacteristicRemote,
	GattDescriptorRemote,
	GattRemote,
	Peripheral
} from '../../../../models';
import { buildTypedValue, BusObject, I_BLUEZ_CHARACTERISTIC, I_BLUEZ_DEVICE, I_BLUEZ_SERVICE } from '../../misc';

import { DbusGattCharacteristicRemote } from './Characteristic';
import { DbusGattServiceRemote } from './Service';

// tslint:disable: promise-must-complete

const DISCOVER_TIMEOUT = 10; // in seconds

export class DbusGattRemote extends GattRemote {
	public busObject: BusObject;

	public services: Map<string, DbusGattServiceRemote> = new Map();

	public constructor(peripheral: Peripheral, busObject: BusObject) {
		super(peripheral);

		this.busObject = busObject;
	}

	private prop<T>(propName: string) {
		return this.busObject.prop<T>(I_BLUEZ_DEVICE, propName);
	}

	protected async doDiscoverServices(): Promise<DbusGattServiceRemote[]> {
		return new Promise<DbusGattServiceRemote[]>(async (resolve, reject) => {
			let cancelled = false;
			const onTimeout = () => {
				cancelled = true;
				reject(new Error('Discovering timed out'));
			};
			const timeout = setTimeout(onTimeout, DISCOVER_TIMEOUT * 1000);

			const servicesResolved = await this.prop<boolean>('ServicesResolved');
			if (!servicesResolved) {
				await new Promise(async (res) => {
					const propertiesIface = await this.busObject.getPropertiesInterface();
					const onPropertiesChanged = (iface: string, changedProps: any) => {
						if (iface !== I_BLUEZ_DEVICE) {
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
			} else {
				clearTimeout(timeout);
			}

			const serviceIds = await this.busObject.getChildrenNames();
			for (const serviceId of serviceIds) {
				let service = this.services.get(serviceId);
				if (!service) {
					const busObject = this.busObject.getChild(serviceId);
					const uuid = (await busObject.prop<string>(I_BLUEZ_SERVICE, 'UUID')).replace(/\-/g, '');
					service = new DbusGattServiceRemote(this, uuid, busObject);
					this.services.set(uuid, service);
				}
			}

			resolve([...this.services.values()]);
		});
	}

	public async discoverCharacteristics(serviceUUID: string): Promise<GattCharacteristicRemote[]> {
		const service = this.services.get(serviceUUID);
		if (!service) {
			throw new Error(`Service ${serviceUUID} not found`);
		}

		const characteristicNames = await service.busObject.getChildrenNames();
		const characteristics: DbusGattCharacteristicRemote[] = [];

		for (const characteristicId of characteristicNames) {
			const busObject = service.busObject.getChild(characteristicId);
			const uuid = (await busObject.prop<string>(I_BLUEZ_CHARACTERISTIC, 'UUID')).replace(/\-/g, '');
			const properties = await busObject.prop<GattCharacteristicProperty[]>(I_BLUEZ_CHARACTERISTIC, 'Flags');
			const characteristic = new DbusGattCharacteristicRemote(service, uuid, properties, busObject);
			characteristics.push(characteristic);
		}

		return characteristics;
	}

	public async read(serviceUUID: string, characteristicUUID: string): Promise<Buffer> {
		const service = this.services.get(serviceUUID);
		if (!service) {
			throw new Error(`Service ${serviceUUID} not found`);
		}

		const characteristic = service.characteristics.get(characteristicUUID);
		if (!characteristic) {
			throw new Error(`Characteristic ${characteristicUUID} in service ${serviceUUID} not found`);
		}

		const options = {
			offset: buildTypedValue('uint16', 0)
		};
		const payload = await characteristic.busObject.callMethod<any>(I_BLUEZ_CHARACTERISTIC, 'ReadValue', options);
		return Buffer.from(payload);
	}
	public async write(
		serviceUUID: string,
		characteristicUUID: string,
		data: Buffer,
		withoutResponse: boolean
	): Promise<void> {
		const service = this.services.get(serviceUUID);
		if (!service) {
			throw new Error(`Service ${serviceUUID} not found`);
		}

		const characteristic = service.characteristics.get(characteristicUUID);
		if (!characteristic) {
			throw new Error(`Characteristic ${characteristicUUID} in service ${serviceUUID} not found`);
		}

		const options = {
			offset: buildTypedValue('uint16', 0),
			type: buildTypedValue('string', withoutResponse ? 'command' : 'request')
		};
		await characteristic.busObject.callMethod(I_BLUEZ_CHARACTERISTIC, 'WriteValue', [...data], options);
	}
	public async broadcast(serviceUUID: string, characteristicUUID: string, broadcast: boolean): Promise<void> {
		throw new Error('Method not implemented.');
	}
	public async notify(serviceUUID: string, characteristicUUID: string, notify: boolean): Promise<void> {
		throw new Error('Method not implemented.');
	}
	public async discoverDescriptors(serviceUUID: string, characteristicUUID: string): Promise<GattDescriptorRemote[]> {
		throw new Error('Method not implemented.');
	}

	public async readValue(serviceUUID: string, characteristicUUID: string, descriptorUUID: string): Promise<Buffer> {
		throw new Error('Method not implemented.');
	}
	public async writeValue(
		serviceUUID: string,
		characteristicUUID: string,
		descriptorUUID: string,
		data: Buffer
	): Promise<void> {
		throw new Error('Method not implemented.');
	}
}
