import { Characteristic, Service } from '../../models';

import { BusObject, I_BLUEZ_CHARACTERISTIC } from './BusObject';
import { DbusCharacteristic } from './Characteristic';
import { DbusNoble } from './Noble';
import { DbusPeripheral } from './Peripheral';

export class DbusService extends Service<DbusNoble, DbusPeripheral> {
	private readonly object: BusObject;

	private characteristics: Map<string, Characteristic> = new Map();

	public constructor(noble: DbusNoble, peripheral: DbusPeripheral, uuid: string, object: BusObject) {
		super(noble, peripheral, uuid);

		this.object = object;
	}

	public async discoverIncludedServices(serviceUUIDs: string[]): Promise<Service[]> {
		throw new Error('Method not implemented.');
	}

	public getDiscoveredCharacteristics(): Characteristic[] {
		return [...this.characteristics.values()];
	}

	public async discoverCharacteristics(characteristicUUIDs?: string[]): Promise<Characteristic[]> {
		const characteristicNames = await this.object.getChildrenNames();
		for (const characteristicId of characteristicNames) {
			let characteristic = this.characteristics.get(characteristicId);
			if (!characteristic) {
				const object = this.object.getChild(characteristicId);
				const uuid = (await object.prop<string>(I_BLUEZ_CHARACTERISTIC, 'UUID')).replace(/\-/g, '');
				const properties = await object.prop<string[]>(I_BLUEZ_CHARACTERISTIC, 'Flags');
				characteristic = new DbusCharacteristic(this.noble, this, uuid, properties, object);
				this.characteristics.set(uuid, characteristic);
			}
		}

		return [...this.characteristics.values()];
	}
}
