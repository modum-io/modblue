import { GattDescriptor } from '../Descriptor';

import { GattCharacteristicRemote } from './Characteristic';

export class GattDescriptorRemote extends GattDescriptor {
	public readonly characteristic: GattCharacteristicRemote;
	protected get gatt() {
		return this.characteristic.service.gatt;
	}

	public readValue(): Promise<Buffer> {
		return this.gatt.readValue(this.characteristic.service.uuid, this.characteristic.uuid, this.uuid);
	}
	public writeValue(data: Buffer): Promise<void> {
		return this.gatt.writeValue(this.characteristic.service.uuid, this.characteristic.uuid, this.uuid, data);
	}
}
