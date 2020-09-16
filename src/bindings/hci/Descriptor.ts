import { BaseDescriptor } from '../../Descriptor';

import { Characteristic } from './Characteristic';
import { Gatt } from './gatt';
import { Noble } from './Noble';

export class Descriptor extends BaseDescriptor {
	private gatt: Gatt;

	public constructor(noble: Noble, characteristic: Characteristic, uuid: string, gatt: Gatt) {
		super(noble, characteristic, uuid);

		this.gatt = gatt;
	}

	public readValue(): Promise<Buffer> {
		return new Promise<Buffer>((resolve) => {
			const done = (serviceUUID: string, characteristicUUID: string, descriptorUUID: string, data: Buffer) => {
				if (
					serviceUUID !== this.characteristic.service.uuid ||
					characteristicUUID !== this.characteristic.uuid ||
					descriptorUUID !== this.uuid
				) {
					// This isn't our descriptor, ignore
					return;
				}

				this.gatt.off('valueRead', done);

				resolve(data);
			};

			this.gatt.on('valueRead', done);

			this.gatt.readValue(this.characteristic.service.uuid, this.characteristic.uuid, this.uuid);
		});
	}

	public writeValue(data: Buffer): Promise<void> {
		return new Promise<void>((resolve) => {
			const done = (serviceUUID: string, characteristicUUID: string, descriptorUUID: string) => {
				if (
					serviceUUID !== this.characteristic.service.uuid ||
					characteristicUUID !== this.characteristic.uuid ||
					descriptorUUID !== this.uuid
				) {
					// This isn't our descriptor, ignore
					return;
				}

				this.gatt.off('valueWrite', done);

				resolve();
			};

			this.gatt.on('valueWrite', done);

			this.gatt.writeValue(this.characteristic.service.uuid, this.characteristic.uuid, this.uuid, data);
		});
	}
}
