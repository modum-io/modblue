import { GattDescriptor } from '../../../models';

import { WinGattCharacteristic } from './Characteristic';

export class WinGattDescriptor extends GattDescriptor {
	public readonly characteristic: WinGattCharacteristic;

	public read(): Promise<Buffer> {
		const noble = this.characteristic.service.gatt.peripheral.adapter.noble;

		return new Promise<Buffer>((resolve, reject) => {
			const handler = (dev: string, srv: string, char: string, desc: string, data: Buffer | Error) => {
				if (
					dev === this.characteristic.service.gatt.peripheral.uuid &&
					srv === this.characteristic.service.uuid &&
					char === this.characteristic.uuid &&
					desc === this.uuid
				) {
					noble.off('valueRead', handler);
					if (data instanceof Error) {
						reject(data);
					} else {
						resolve(data);
					}
				}
			};
			noble.on('valueRead', handler);

			noble.readValue(
				this.characteristic.service.gatt.peripheral.uuid,
				this.characteristic.service.uuid,
				this.characteristic.uuid,
				this.uuid
			);
		});
	}

	public write(value: Buffer): Promise<void> {
		const noble = this.characteristic.service.gatt.peripheral.adapter.noble;

		return new Promise<void>((resolve, reject) => {
			const handler = (dev: string, srv: string, char: string, desc: string, err: Error) => {
				if (
					dev === this.characteristic.service.gatt.peripheral.uuid &&
					srv === this.characteristic.service.uuid &&
					char === this.characteristic.uuid &&
					desc === this.uuid
				) {
					noble.off('valueWrite', handler);
					if (err) {
						reject(err);
					} else {
						resolve();
					}
				}
			};
			noble.on('valueWrite', handler);

			noble.writeValue(
				this.characteristic.service.gatt.peripheral.uuid,
				this.characteristic.service.uuid,
				this.characteristic.uuid,
				this.uuid,
				value
			);
		});
	}
}
