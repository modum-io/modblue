import { Characteristic } from './Characteristic';
import { Noble } from './Noble';
import { Peripheral } from './Peripheral';

export abstract class Service<N extends Noble = Noble, P extends Peripheral = Peripheral> {
	protected readonly noble: N;

	public readonly peripheral: P;

	public readonly uuid: string;

	public constructor(noble: N, peripheral: P, uuid: string) {
		this.noble = noble;
		this.peripheral = peripheral;

		this.uuid = uuid;
	}

	public toString() {
		return JSON.stringify({
			peripheralUUID: this.peripheral.uuid,
			uuid: this.uuid
		});
	}

	public abstract async discoverIncludedServices(serviceUUIDs: string[]): Promise<Service[]>;

	public abstract getDiscoveredCharacteristics(): Characteristic[];

	public abstract async discoverCharacteristics(characteristicUUIDs?: string[]): Promise<Characteristic[]>;
}
