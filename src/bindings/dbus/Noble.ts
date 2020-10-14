import { ClientInterface, MessageBus, systemBus } from 'dbus-next';

import { Noble } from '../../models';

import { DbusAdapter } from './Adapter';
import { I_BLUEZ_ADAPTER, I_OBJECT_MANAGER } from './misc';

export class DbusNoble extends Noble {
	public readonly dbus: MessageBus;

	private objManagerIface: ClientInterface;
	private adapters: Map<string, DbusAdapter> = new Map();

	public constructor() {
		super();

		this.dbus = systemBus();
	}

	public async dispose() {
		this.adapters = new Map();
	}

	public async getAdapters(): Promise<DbusAdapter[]> {
		if (!this.objManagerIface) {
			const objManager = await this.dbus.getProxyObject('org.bluez', '/');
			this.objManagerIface = objManager.getInterface(I_OBJECT_MANAGER);
		}

		const objs = await this.objManagerIface.GetManagedObjects();
		const keys = Object.keys(objs);

		for (const adapterPath of keys) {
			const adapterObj = objs[adapterPath][I_BLUEZ_ADAPTER];
			if (!adapterObj) {
				continue;
			}

			let adapter = this.adapters.get(adapterPath);
			if (!adapter) {
				adapter = new DbusAdapter(this, adapterPath, adapterObj.Name, adapterObj.Address);
				this.adapters.set(adapterPath, adapter);
			}
		}

		return [...this.adapters.values()];
	}
}
