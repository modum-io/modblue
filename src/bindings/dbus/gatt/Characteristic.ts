import { ClientInterface } from 'dbus-next';

import { GattCharacteristic, GattCharacteristicProperty, GattDescriptor } from '../../../models';
import { buildTypedValue, I_BLUEZ_CHARACTERISTIC } from '../misc';

import { DbusGattService } from './Service';

export class DbusGattCharacteristic extends GattCharacteristic {
	public readonly service: DbusGattService;

	public readonly path: string;

	private iface: ClientInterface;

	private get dbus() {
		return this.service.gatt.peripheral.adapter.modblue.dbus;
	}

	public constructor(
		service: DbusGattService,
		uuid: string,
		isRemote: boolean,
		properties: GattCharacteristicProperty[],
		secure: GattCharacteristicProperty[],
		path: string
	) {
		super(service, uuid, isRemote, properties, secure);

		this.path = path;
	}

	public async discoverDescriptors(): Promise<GattDescriptor[]> {
		throw new Error('Method not implemented.');
	}

	public async read(): Promise<Buffer> {
		const iface = await this.getInterface();

		return iface.ReadValue({
			offset: buildTypedValue('uint16', 0)
		});
	}

	public async write(data: Buffer, withoutResponse: boolean): Promise<void> {
		const iface = await this.getInterface();

		await iface.WriteValue([...data], {
			offset: buildTypedValue('uint16', 0),
			type: buildTypedValue('string', withoutResponse ? 'command' : 'request')
		});
	}

	public async broadcast(): Promise<void> {
		throw new Error('Method not implemented.');
	}

	public async notify(): Promise<void> {
		throw new Error('Method not implemented.');
	}

	private async getInterface() {
		if (!this.iface) {
			const obj = await this.dbus.getProxyObject('org.bluez', this.path);
			this.iface = obj.getInterface(I_BLUEZ_CHARACTERISTIC);
		}

		return this.iface;
	}

	public async addDescriptor(): Promise<GattDescriptor> {
		throw new Error('Method not implemented.');
	}
}
