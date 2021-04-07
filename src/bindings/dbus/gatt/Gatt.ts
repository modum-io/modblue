import { Gatt, GattService } from '../../../models';
import { DbusObject, I_BLUEZ_DEVICE, I_BLUEZ_SERVICE, I_OBJECT_MANAGER, I_PROPERTIES } from '../misc';
import { DbusPeripheral } from '../Peripheral';

import { DbusGattService } from './Service';

const DISCOVER_TIMEOUT = 10; // in seconds

export class DbusGatt extends Gatt {
	public readonly peripheral: DbusPeripheral;
	public readonly services: Map<string, DbusGattService> = new Map();

	private get dbus() {
		return this.peripheral.adapter.modblue.dbus;
	}

	public constructor(peripheral: DbusPeripheral) {
		super(peripheral);
	}

	public async discoverServices(): Promise<DbusGattService[]> {
		const obj = await this.dbus.getProxyObject('org.bluez', this.peripheral.path);
		const propsIface = obj.getInterface(I_PROPERTIES);

		const servicesResolved = (await propsIface.Get(I_BLUEZ_DEVICE, 'ServicesResolved')).value;
		if (!servicesResolved) {
			const timeoutError = new Error('Discovering timed out');
			await new Promise<void>((res, rej) => {
				let timeout: NodeJS.Timeout;

				const onPropertiesChanged = (iface: string, changedProps: DbusObject) => {
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

		const objManager = await this.dbus.getProxyObject(`org.bluez`, '/');
		const objManagerIface = objManager.getInterface(I_OBJECT_MANAGER);

		const objs = await objManagerIface.GetManagedObjects();
		const keys = Object.keys(objs);

		this.services.clear();
		for (const srvPath of keys) {
			if (!srvPath.startsWith(this.peripheral.path)) {
				continue;
			}

			const srvObj = objs[srvPath][I_BLUEZ_SERVICE];
			if (!srvObj) {
				continue;
			}

			const uuid = srvObj.UUID.value.replace(/-/g, '');
			const service = new DbusGattService(this, srvPath, true, uuid);
			this.services.set(service.uuid, service);
		}

		return [...this.services.values()];
	}

	public async addService(): Promise<GattService> {
		throw new Error('Method not implemented.');
	}

	public async prepare(): Promise<void> {
		throw new Error('Method not implemented.');
	}
}
