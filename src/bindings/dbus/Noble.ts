import { MessageBus, systemBus } from 'dbus-next';

import { Noble } from '../../models';

import { DbusAdapter } from './Adapter';
import { BusObject, I_BLUEZ_ADAPTER } from './misc';

export class DbusNoble extends Noble {
	private readonly dbus: MessageBus;
	private bluezObject: BusObject;

	private adapters: Map<string, DbusAdapter> = new Map();

	public constructor() {
		super();

		this.dbus = systemBus();
	}

	public async init() {
		this.bluezObject = new BusObject(this.dbus, 'org.bluez', '/org/bluez');
	}

	public async dispose() {
		this.adapters = new Map();
	}

	public async getAdapters(): Promise<DbusAdapter[]> {
		const adapterIds = await this.bluezObject.getChildrenNames();
		for (const adapterId of adapterIds) {
			let adapter = this.adapters.get(adapterId);
			if (!adapter) {
				const busObject = this.bluezObject.getChild(adapterId);
				const name = await busObject.prop<string>(I_BLUEZ_ADAPTER, 'Name');
				const address = await busObject.prop<string>(I_BLUEZ_ADAPTER, 'Address');
				adapter = new DbusAdapter(this, adapterId, name, address, busObject);
				this.adapters.set(adapterId, adapter);
			}
		}
		return [...this.adapters.values()];
	}
}
