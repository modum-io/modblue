import { Gatt } from './Gatt';

export abstract class GattService {
	public readonly gatt: Gatt;

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
