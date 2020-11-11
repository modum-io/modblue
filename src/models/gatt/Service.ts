import { Gatt } from './Gatt';

/**
 * Represents a GATT service.
 */
export abstract class GattService {
	/**
	 * The GATT server this service belongs to.
	 */
	public readonly gatt: Gatt;

	/**
	 * The UUID of this service, excluding dashes (-).
	 */
	public readonly uuid: string;

	public constructor(gatt: Gatt, uuid: string) {
		this.gatt = gatt;

		this.uuid = uuid;
	}

	public toString() {
		return JSON.stringify({
			uuid: this.uuid
		});
	}
}
