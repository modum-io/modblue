import { BaseCharacteristic } from '../../Characteristic';
import { BaseService } from '../../Service';

import { Characteristic } from './Characteristic';
import { Gatt } from './gatt';
import { Noble } from './Noble';
import { Peripheral } from './Peripheral';

export class Service extends BaseService<Noble, Peripheral> {
	private gatt: Gatt;

	private characteristics: Map<string, Characteristic> = new Map();

	public constructor(noble: Noble, peripheral: Peripheral, uuid: string, gatt: Gatt) {
		super(noble, peripheral, uuid);

		this.gatt = gatt;
	}

	public async discoverIncludedServices(serviceUUIDs?: string[]): Promise<BaseService[]> {
		return this.peripheral.discoverIncludedServices(this, serviceUUIDs);
	}

	public getDiscoveredCharacteristics(): BaseCharacteristic[] {
		return [...this.characteristics.values()];
	}

	public async discoverCharacteristics(characteristicUUIDs?: string[]): Promise<BaseCharacteristic[]> {
		const characteristics = await this.gatt.discoverCharacteristics(this.uuid, characteristicUUIDs || []);

		for (const rawCharacteristic of characteristics) {
			let characteristic = this.characteristics.get(rawCharacteristic.uuid);
			if (!characteristic) {
				characteristic = new Characteristic(
					this.noble,
					this,
					rawCharacteristic.uuid,
					rawCharacteristic.properties,
					this.gatt
				);
				this.characteristics.set(rawCharacteristic.uuid, characteristic);
			}
		}

		return [...this.characteristics.values()];
	}
}
