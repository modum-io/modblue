import { BaseCharacteristic } from './Characteristic';
import { BaseNoble } from './Noble';

export abstract class BaseDescriptor<
	N extends BaseNoble = BaseNoble,
	C extends BaseCharacteristic = BaseCharacteristic
> {
	protected readonly noble: N;

	public readonly characteristic: C;

	public readonly uuid: string;

	public constructor(noble: N, characteristic: C, uuid: string) {
		this.noble = noble;
		this.characteristic = characteristic;

		this.uuid = uuid;
	}

	public toString() {
		return JSON.stringify({
			characteristicUUID: this.characteristic.uuid,
			uuid: this.uuid
		});
	}

	public abstract async readValue(): Promise<Buffer>;

	public abstract async writeValue(data: Buffer): Promise<void>;
}
