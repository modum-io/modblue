import { MessageBus, systemBus } from 'dbus-next';

import { BaseAdapter } from '../../Adapter';
import { BaseNoble } from '../../Noble';

import { Adapter } from './Adapter';
import { BusObject, I_BLUEZ_ADAPTER } from './BusObject';

export class Noble extends BaseNoble {
	private readonly dbus: MessageBus;
	private bluezObject: BusObject;

	private adapters: Map<string, Adapter> = new Map();

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

	public async getAdapters(): Promise<BaseAdapter[]> {
		const adapterIds = await this.bluezObject.getChildrenNames();
		for (const adapterId of adapterIds) {
			let adapter = this.adapters.get(adapterId);
			if (!adapter) {
				const object = this.bluezObject.getChild(adapterId);
				const name = await object.prop<string>(I_BLUEZ_ADAPTER, 'Name');
				const address = await object.prop<string>(I_BLUEZ_ADAPTER, 'Address');
				adapter = new Adapter(this, adapterId, name, address, object);
				this.adapters.set(adapterId, adapter);
			}
		}
		return [...this.adapters.values()];
	}
}
