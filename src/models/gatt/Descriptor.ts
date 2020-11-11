import { GattCharacteristic } from './Characteristic';

/**
 * Represents a GATT Descriptor.
 */
export abstract class GattDescriptor {
	/**
	 * The GATT characteristic that this descriptor belongs to
	 */
	public readonly characteristic: GattCharacteristic;

	/**
	 * The UUID of this descriptor.
	 */
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
