import { GattCharacteristic } from './Characteristic';

export abstract class GattDescriptor {
	public readonly characteristic: GattCharacteristic;

	public readonly uuid: string;

	public constructor(characteristic: GattCharacteristic, uuid: string) {
		this.characteristic = characteristic;

		this.uuid = uuid;
	}

	public toString() {
		return JSON.stringify({
			characteristicUUID: this.characteristic.uuid,
			uuid: this.uuid
		});
	}
}
