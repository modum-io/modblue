import { GattCharacteristic, GattCharacteristicProperty, GattService } from '../../../models';

import { MacGattCharacteristic } from './Characteristic';
import { MacGatt } from './Gatt';

export class MacGattService extends GattService {
	public readonly gatt: MacGatt;

	public addCharacteristic(): Promise<GattCharacteristic> {
		throw new Error('Method not implemented.');
	}

	public discoverCharacteristics(): Promise<GattCharacteristic[]> {
		const noble = this.gatt.peripheral.adapter.noble;

		return new Promise<GattCharacteristic[]>((resolve) => {
			const handler = (
				uuid: string,
				serviceUUID: string,
				characteristics: { uuid: string; properties: GattCharacteristicProperty[] }[]
			) => {
				if (uuid === this.gatt.peripheral.uuid && serviceUUID === this.uuid) {
					noble.off('characteristicsDiscover', handler);
					for (const char of characteristics) {
						this.characteristics.set(char.uuid, new MacGattCharacteristic(this, char.uuid, true, char.properties, []));
					}
					resolve([...this.characteristics.values()]);
				}
			};
			noble.on('characteristicsDiscover', handler);

			this.characteristics.clear();
			noble.discoverCharacteristics(this.gatt.peripheral.uuid, this.uuid);
		});
	}
}
