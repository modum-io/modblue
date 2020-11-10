import { Peripheral } from '../../Peripheral';
import { Gatt } from '../Gatt';

import { GattCharacteristicRemote } from './Characteristic';
import { GattDescriptorRemote } from './Descriptor';
import { GattServiceRemote } from './Service';

export abstract class GattRemote extends Gatt {
	public readonly peripheral: Peripheral;

	public readonly services: Map<string, GattServiceRemote> = new Map();

	protected _mtu: number;
	public get mtu() {
		return this._mtu;
	}

	public constructor(peripheral: Peripheral) {
		super();

		this.peripheral = peripheral;
	}

	public toString() {
		return JSON.stringify({
			mtu: this.mtu,
			peripheralUUID: this.peripheral.uuid
		});
	}

	public async discoverServices(): Promise<GattServiceRemote[]> {
		const services = await this.doDiscoverServices();
		for (const service of services) {
			this.services.set(service.uuid, service);
		}
		return [...this.services.values()];
	}
	protected abstract doDiscoverServices(): Promise<GattServiceRemote[]>;

	public abstract discoverCharacteristics(serviceUUID: string): Promise<GattCharacteristicRemote[]>;

	public abstract read(serviceUUID: string, characteristicUUID: string): Promise<Buffer>;
	public abstract write(
		serviceUUID: string,
		characteristicUUID: string,
		data: Buffer,
		withoutResponse: boolean
	): Promise<void>;
	public abstract broadcast(serviceUUID: string, characteristicUUID: string, broadcast: boolean): Promise<void>;
	public abstract notify(serviceUUID: string, characteristicUUID: string, notify: boolean): Promise<void>;
	public abstract discoverDescriptors(serviceUUID: string, characteristicUUID: string): Promise<GattDescriptorRemote[]>;

	public abstract readValue(serviceUUID: string, characteristicUUID: string, descriptorUUID: string): Promise<Buffer>;
	public abstract writeValue(
		serviceUUID: string,
		characteristicUUID: string,
		descriptorUUID: string,
		data: Buffer
	): Promise<void>;
}
