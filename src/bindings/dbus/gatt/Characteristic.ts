import { ClientInterface } from 'dbus-next';

import { GattCharacteristic, GattCharacteristicProperty, GattDescriptor } from '../../../models';
import { buildTypedValue, DbusObject, I_BLUEZ_CHARACTERISTIC, I_PROPERTIES } from '../misc';

import { DbusGattService } from './Service';

export class DbusGattCharacteristic extends GattCharacteristic {
	public readonly service: DbusGattService;

	public readonly path: string;

	private iface: ClientInterface;
	private propsIface: ClientInterface;

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

	public async notify(notify: boolean): Promise<void> {
		const iface = await this.getInterface();
		const propsIface = await this.getPropsInterface();

		if (notify) {
			propsIface.on('PropertiesChanged', this.onPropsChanged);
			await iface.StartNotify();
		} else {
			propsIface.off('PropertiesChanged', this.onPropsChanged);
			await iface.StopNotify();
		}
	}

	private onPropsChanged = (iface: string, changedProps: DbusObject) => {
		if (iface !== I_BLUEZ_CHARACTERISTIC) {
			return;
		}

		if ('Value' in changedProps) {
			this.emit('notification', changedProps.Value.value as Buffer);
		}
	};

	private async getInterface() {
		if (!this.iface) {
			const obj = await this.dbus.getProxyObject('org.bluez', this.path);
			this.iface = obj.getInterface(I_BLUEZ_CHARACTERISTIC);
		}

		return this.iface;
	}

	private async getPropsInterface() {
		if (!this.propsIface) {
			const obj = await this.dbus.getProxyObject('org.bluez', this.path);
			this.propsIface = obj.getInterface(I_PROPERTIES);
		}

		return this.propsIface;
	}

	public async addDescriptor(): Promise<GattDescriptor> {
		throw new Error('Method not implemented.');
	}
}
