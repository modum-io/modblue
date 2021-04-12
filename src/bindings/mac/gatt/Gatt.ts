import { GattRemote, GattService } from '../../../models';

import { MacPeripheral } from '../Peripheral';
import { MacGattService } from './Service';

export class MacGatt extends GattRemote {
	public readonly peripheral: MacPeripheral;

	public discoverServices(): Promise<GattService[]> {
		const noble = this.peripheral.adapter.noble;

		this.services.clear();
		noble.discoverServices(this.peripheral.uuid);

		return new Promise<GattService[]>((resolve) => {
			const handler = (uuid: string, serviceUUIDs: string[]) => {
				if (uuid === this.peripheral.uuid) {
					noble.off('servicesDiscover', handler);
					for (const srvUUID of serviceUUIDs) {
						this.services.set(srvUUID, new MacGattService(this, srvUUID, true));
					}
					resolve([...this.services.values()]);
				}
			};
			noble.on('servicesDiscover', handler);
		});
	}
}
