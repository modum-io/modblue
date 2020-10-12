import { MessageBus, ProxyObject } from 'dbus-next';

export const I_BLUEZ_ADAPTER = 'org.bluez.Adapter1';
export const I_BLUEZ_DEVICE = 'org.bluez.Device1';
export const I_BLUEZ_SERVICE = 'org.bluez.GattService1';
export const I_BLUEZ_CHARACTERISTIC = 'org.bluez.GattCharacteristic1';

export const I_PROPERTIES = 'org.freedesktop.DBus.Properties';
export const I_OBJECT_MANAGER = 'org.freedesktop.DBus.ObjectManager';

export class BusObject {
	private readonly dbus: MessageBus;
	public readonly serviceName: string;
	public readonly objectName: string;

	private _object: ProxyObject;
	private async getObject(refresh?: boolean) {
		if (refresh || !this._object) {
			this._object = await this.dbus.getProxyObject(this.serviceName, this.objectName);
		}
		return this._object;
	}

	public constructor(dbus: MessageBus, serviceName: string, objectName: string) {
		this.dbus = dbus;
		this.objectName = objectName;
		this.serviceName = serviceName;
	}

	public getChild(childName: string) {
		return new BusObject(this.dbus, this.serviceName, `${this.objectName}/${childName}`);
	}

	public async getChildrenNames() {
		const path = this.objectName === '/' ? '' : this.objectName;
		const object = await this.getObject(true);

		const children = new Set<string>();
		for (const node of object.nodes) {
			if (!node.startsWith(path)) {
				continue;
			}

			const end = node.indexOf('/', path.length + 1);
			const sub = end >= 0 ? node.substring(path.length + 1, end) : node.substring(path.length + 1);
			if (sub.length < 1) {
				continue;
			}

			children.add(sub);
		}

		return [...children.values()];
	}

	public async getInterface(interfaceName: string) {
		const object = await this.getObject();
		return object.getInterface(interfaceName);
	}
	public async getPropertiesInterface() {
		return this.getInterface(I_PROPERTIES);
	}

	public async prop<T = string>(interfaceName: string, propName: string): Promise<T> {
		const iface = await this.getPropertiesInterface();
		const rawProp = await iface.Get(interfaceName, propName);
		return rawProp.value;
	}

	public async callMethod<T = void>(interfaceName: string, methodName: string, ...args: any[]): Promise<T> {
		const object = await this.getObject();
		if (typeof object.getInterface(interfaceName)[methodName] !== 'function') {
			throw new Error(`Method ${methodName} on ${interfaceName} for ${object.name} doesn't exist`);
		}
		return object.getInterface(interfaceName)[methodName](...args);
	}

	public async on(interfaceName: string, event: string | symbol, listener: (...args: any[]) => void) {
		const object = await this.getObject();
		object.getInterface(interfaceName).on(event, listener);
	}

	public async once(interfaceName: string, event: string | symbol, listener: (...args: any[]) => void) {
		const object = await this.getObject();
		object.getInterface(interfaceName).once(event, listener);
	}

	public async off(interfaceName: string, event: string | symbol, listener: (...args: any[]) => void) {
		const object = await this.getObject();
		object.getInterface(interfaceName).off(event, listener);
	}
}
