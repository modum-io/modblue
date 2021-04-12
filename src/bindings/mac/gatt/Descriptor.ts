import { GattDescriptor } from '../../../models';

import { MacGattCharacteristic } from './Characteristic';

export class MacGattDescriptor extends GattDescriptor {
	public readonly characteristic: MacGattCharacteristic;

	public read(): Promise<Buffer> {
		const noble = this.characteristic.service.gatt.peripheral.adapter.noble;

		noble.readValue(
			this.characteristic.service.gatt.peripheral.uuid,
			this.characteristic.service.uuid,
			this.characteristic.uuid,
			this.uuid
		);

		return new Promise<Buffer>((resolve) => {
			const handler = (dev: string, srv: string, char: string, desc: string, data: Buffer) => {
				if (
					dev === this.characteristic.service.gatt.peripheral.uuid &&
					srv === this.characteristic.service.uuid &&
					char === this.characteristic.uuid &&
					desc === this.uuid
				) {
					noble.off('valueRead', handler);
					resolve(data);
				}
			};
			noble.on('valueRead', handler);
		});
	}

	public write(value: Buffer): Promise<void> {
		const noble = this.characteristic.service.gatt.peripheral.adapter.noble;

		noble.writeValue(
			this.characteristic.service.gatt.peripheral.uuid,
			this.characteristic.service.uuid,
			this.characteristic.uuid,
			this.uuid,
			value
		);

		return new Promise<void>((resolve) => {
			const handler = (dev: string, srv: string, char: string, desc: string) => {
				if (
					dev === this.characteristic.service.gatt.peripheral.uuid &&
					srv === this.characteristic.service.uuid &&
					char === this.characteristic.uuid &&
					desc === this.uuid
				) {
					noble.off('valueWrite', handler);
					resolve();
				}
			};
			noble.on('valueWrite', handler);
		});
	}
}
