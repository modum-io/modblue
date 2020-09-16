import { BaseCharacteristic } from './Characteristic';
import { BaseNoble } from './Noble';
import { BasePeripheral } from './Peripheral';

export abstract class BaseService<N extends BaseNoble = BaseNoble, P extends BasePeripheral = BasePeripheral> {
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

	public abstract async discoverIncludedServices(serviceUUIDs: string[]): Promise<BaseService[]>;

	public abstract async discoverCharacteristics(characteristicUUIDs?: string[]): Promise<BaseCharacteristic[]>;
}
