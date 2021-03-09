import { GattDescriptor } from '../Descriptor';

import { GattCharacteristicRemote } from './Characteristic';
import { GattRemote } from './Gatt';

/**
 * Represents a descriptor of a remote GATT characterstic.
 */
export class GattDescriptorRemote extends GattDescriptor {
	/**
	 * The remote GATT characteristic that this descriptor belongs to.
	 */
	public readonly characteristic: GattCharacteristicRemote;
	protected get gatt(): GattRemote {
		return this.characteristic.service.gatt;
	}

	/**
	 * Read the current value of this descriptor.
	 */
	public readValue(): Promise<Buffer> {
		return this.gatt.readValue(this.characteristic.service.uuid, this.characteristic.uuid, this.uuid);
	}
	/**
	 * Writes the specified data to this descriptor.
	 * @param data The data to write.
	 */
	public writeValue(data: Buffer): Promise<void> {
		return this.gatt.writeValue(this.characteristic.service.uuid, this.characteristic.uuid, this.uuid, data);
	}
}
