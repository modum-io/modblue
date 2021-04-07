import { GattDescriptor } from '../../../models';

import { WebGattCharacteristic } from './Characteristic';

export class WebGattDescriptor extends GattDescriptor {
	public readonly characteristic: WebGattCharacteristic;

	private desc: BluetoothRemoteGATTDescriptor;

	public constructor(characteristic: WebGattCharacteristic, descriptor: BluetoothRemoteGATTDescriptor) {
		super(characteristic, descriptor.uuid, true);

		this.desc = descriptor;
	}

	public async read(): Promise<Buffer> {
		const view = await this.desc.readValue();
		return view.buffer as Buffer;
	}

	public async write(data: Buffer): Promise<void> {
		await this.desc.writeValue(data);
	}
}
