import { Characteristic, Service } from '../../models';

import { HciCharacteristic } from './Characteristic';
import { Gatt } from './gatt';
import { HciNoble } from './Noble';
import { HciPeripheral } from './Peripheral';

export class HciService extends Service<HciNoble, HciPeripheral> {
	private gatt: Gatt;

	private characteristics: Map<string, Characteristic> = new Map();

	public constructor(noble: HciNoble, peripheral: HciPeripheral, uuid: string, gatt: Gatt) {
		super(noble, peripheral, uuid);

		this.gatt = gatt;
	}

	public async discoverIncludedServices(serviceUUIDs?: string[]): Promise<Service[]> {
		return this.peripheral.discoverIncludedServices(this, serviceUUIDs);
	}

	public getDiscoveredCharacteristics(): Characteristic[] {
		return [...this.characteristics.values()];
	}

	public async discoverCharacteristics(characteristicUUIDs?: string[]): Promise<Characteristic[]> {
		const characteristics = await this.gatt.discoverCharacteristics(this.uuid, characteristicUUIDs || []);

		for (const rawCharacteristic of characteristics) {
			let characteristic = this.characteristics.get(rawCharacteristic.uuid);
			if (!characteristic) {
				characteristic = new HciCharacteristic(
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
