import { BaseService } from '../../Service';

import { BusObject, I_BLUEZ_CHARACTERISTIC } from './BusObject';
import { Characteristic } from './Characteristic';
import { Noble } from './Noble';
import { Peripheral } from './Peripheral';

export class Service extends BaseService<Noble, Peripheral> {
	private readonly object: BusObject;

	private characteristics: Map<string, Characteristic> = new Map();

	public constructor(noble: Noble, peripheral: Peripheral, uuid: string, object: BusObject) {
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
				const uuid = await object.prop<string>(I_BLUEZ_CHARACTERISTIC, 'UUID');
				const properties = await object.prop<string[]>(I_BLUEZ_CHARACTERISTIC, 'Flags');
				console.log(properties);
				characteristic = new Characteristic(this.noble, this, uuid, properties, object);
				this.characteristics.set(uuid, characteristic);
			}
		}

		return [...this.characteristics.values()];
	}
}
