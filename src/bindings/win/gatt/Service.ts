import { GattCharacteristic, GattCharacteristicProperty, GattService } from '../../../models';

import { WinGattCharacteristic } from './Characteristic';
import { WinGatt } from './Gatt';

export class WinGattService extends GattService {
	public readonly gatt: WinGatt;

	public addCharacteristic(): Promise<GattCharacteristic> {
		throw new Error('Method not implemented.');
	}

	public discoverCharacteristics(): Promise<GattCharacteristic[]> {
		const noble = this.gatt.peripheral.adapter.noble;

		this.characteristics.clear();
		noble.discoverCharacteristics(this.gatt.peripheral.uuid, this.uuid);

		return new Promise<GattCharacteristic[]>((resolve, reject) => {
			const handler = (
				uuid: string,
				serviceUUID: string,
				characteristics: { uuid: string; properties: GattCharacteristicProperty[] }[] | Error
			) => {
				if (uuid === this.gatt.peripheral.uuid && serviceUUID === this.uuid) {
					noble.off('characteristicsDiscover', handler);
					if (characteristics instanceof Error) {
						reject(characteristics);
					} else {
						for (const char of characteristics) {
							this.characteristics.set(
								char.uuid,
								new WinGattCharacteristic(this, char.uuid, true, char.properties, [])
							);
						}
						resolve([...this.characteristics.values()]);
					}
				}
			};
			noble.on('characteristicsDiscover', handler);
		});
	}
}
