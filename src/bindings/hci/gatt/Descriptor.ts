import { GattDescriptor } from '../../../models';

import { HciGattCharacteristic } from './Characteristic';
import { HciGattLocal } from './GattLocal';

export class HciGattDescriptor extends GattDescriptor {
	public readonly characteristic: HciGattCharacteristic;

	public handle: number;

	private get service() {
		return this.characteristic.service;
	}
	private get gatt() {
		return this.service.gatt;
	}

	public constructor(
		characteristic: HciGattCharacteristic,
		uuid: string,
		isRemote: boolean,
		handle: number,
		value?: Buffer
	) {
		super(characteristic, uuid, isRemote, value);

		this.handle = handle;
	}

	public async read(): Promise<Buffer> {
		if (this.gatt instanceof HciGattLocal) {
			return this.handleRead(0);
		} else {
			return this.gatt.readDescriptor(this.service.uuid, this.characteristic.uuid, this.uuid);
		}
	}

	public async write(data: Buffer): Promise<void> {
		if (this.gatt instanceof HciGattLocal) {
			await this.handleWrite(0, data);
		} else {
			await this.gatt.writeDescriptor(this.service.uuid, this.characteristic.uuid, this.uuid, data);
		}
	}
}
