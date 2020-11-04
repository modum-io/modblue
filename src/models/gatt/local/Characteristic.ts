import { GattCharacteristic, GattCharacteristicProperty } from '../Characteristic';

import { GattDescriptorLocal } from './Descriptor';
import { GattServiceLocal } from './Service';

export type ReadFunction = (offset: number) => Promise<[number, Buffer]>;
export type WriteFunction = (offset: number, data: Buffer, withoutResponse: boolean) => Promise<number>;

export class GattCharacteristicLocal extends GattCharacteristic {
	public readonly service: GattServiceLocal;

	public readonly descriptors: GattDescriptorLocal[];

	private readonly readFunc: ReadFunction;
	private readonly writeFunc: WriteFunction;

	public constructor(
		service: GattServiceLocal,
		uuid: string,
		properties: GattCharacteristicProperty[],
		secure: GattCharacteristicProperty[],
		readFunc: ReadFunction,
		writeFunc: WriteFunction,
		descriptors: GattDescriptorLocal[]
	) {
		super(service, uuid, properties, secure);

		this.descriptors = descriptors;
		this.readFunc = readFunc;
		this.writeFunc = writeFunc;
	}

	public async readRequest(offset: number): Promise<[number, Buffer]> {
		return this.readFunc(offset);
	}

	public async writeRequest(offset: number, data: Buffer, withoutResponse: boolean): Promise<number> {
		return this.writeFunc(offset, data, withoutResponse);
	}
}
