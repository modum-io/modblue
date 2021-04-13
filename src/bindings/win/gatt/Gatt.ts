import { GattRemote, GattService } from '../../../models';

import { WinPeripheral } from '../Peripheral';
import { WinGattService } from './Service';

export class WinGatt extends GattRemote {
	public readonly peripheral: WinPeripheral;

	public discoverServices(): Promise<GattService[]> {
		const noble = this.peripheral.adapter.noble;

		this.services.clear();
		noble.discoverServices(this.peripheral.uuid);

		return new Promise<GattService[]>((resolve) => {
			const handler = (uuid: string, serviceUUIDs: string[]) => {
				if (uuid === this.peripheral.uuid) {
					noble.off('servicesDiscover', handler);
					for (const srvUUID of serviceUUIDs) {
						this.services.set(srvUUID, new WinGattService(this, srvUUID, true));
					}
					resolve([...this.services.values()]);
				}
			};
			noble.on('servicesDiscover', handler);
		});
	}
}
