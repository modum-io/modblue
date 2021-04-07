import {
	GattCharacteristic,
	GattCharacteristicProperty,
	GattDescriptor,
	ReadFunction,
	WriteFunction
} from '../../../models';

import { HciGattDescriptor } from './Descriptor';
import { HciGattLocal } from './GattLocal';
import { HciGattService } from './Service';

export class HciGattCharacteristic extends GattCharacteristic {
	public readonly service: HciGattService;
	public readonly descriptors: Map<string, HciGattDescriptor> = new Map();

	public startHandle: number;
	public valueHandle: number;
	public endHandle: number;

	private get gatt() {
		return this.service.gatt;
	}

	public constructor(
		service: HciGattService,
		uuid: string,
		isRemote: boolean,
		propsOrFlag: number | GattCharacteristicProperty[],
		secureOrFlag: number | GattCharacteristicProperty[],
		startHandle: number,
		valueHandle: number,
		readFuncOrValue?: ReadFunction | Buffer,
		writeFunc?: WriteFunction
	) {
		super(service, uuid, isRemote, propsOrFlag, secureOrFlag, readFuncOrValue, writeFunc);

		this.startHandle = startHandle;
		this.valueHandle = valueHandle;
	}

	public async addDescriptor(uuid: string, value: Buffer): Promise<GattDescriptor> {
		const desc = new HciGattDescriptor(this, uuid, false, 0, value);
		this.descriptors.set(desc.uuid, desc);
		return desc;
	}

	public async discoverDescriptors(): Promise<GattDescriptor[]> {
		if (this.gatt instanceof HciGattLocal) {
			return [...this.descriptors.values()];
		} else {
			const newDescs = await this.gatt.discoverDescriptors(this.service.uuid, this.uuid);

			this.descriptors.clear();
			for (const desc of newDescs) {
				this.descriptors.set(desc.uuid, desc);
			}

			return newDescs;
		}
	}

	public async read(): Promise<Buffer> {
		if (this.gatt instanceof HciGattLocal) {
			return this.handleRead(0);
		} else {
			return this.gatt.readCharacteristic(this.service.uuid, this.uuid);
		}
	}

	public async write(data: Buffer, withoutResponse: boolean): Promise<void> {
		if (this.gatt instanceof HciGattLocal) {
			await this.handleWrite(0, data, withoutResponse);
		} else {
			await this.gatt.writeCharacteristic(this.service.uuid, this.uuid, data, withoutResponse);
		}
	}

	public async broadcast(broadcast: boolean): Promise<void> {
		if (this.gatt instanceof HciGattLocal) {
			throw new Error('Not supported');
		} else {
			await this.gatt.broadcastCharacteristic(this.service.uuid, this.uuid, broadcast);
		}
	}

	public async notify(notify: boolean): Promise<void> {
		if (this.gatt instanceof HciGattLocal) {
			throw new Error('Not supported');
		} else {
			await this.gatt.notifyCharacteristic(this.service.uuid, this.uuid, notify);
		}
	}
}
