import { Characteristic } from './Characteristic';
import { Noble } from './Noble';

export abstract class Descriptor<N extends Noble = Noble, C extends Characteristic = Characteristic> {
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
