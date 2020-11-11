import { Peripheral } from '../../Peripheral';
import { Gatt } from '../Gatt';

import { GattCharacteristicRemote } from './Characteristic';
import { GattDescriptorRemote } from './Descriptor';
import { GattServiceRemote } from './Service';

/**
 * Represents a GATT server on a remote {@link Peripheral}.
 */
export abstract class GattRemote extends Gatt {
	/**
	 * The peripheral that this GATT server belongs to.
	 */
	public readonly peripheral: Peripheral;

	/**
	 * A map of UUID to services that were discovered during {@link discoverServices}.
	 */
	public readonly services: Map<string, GattServiceRemote> = new Map();

	protected _mtu: number;
	/**
	 * The MTU that was agreed upon during the MTU negotiation.
	 */
	public get mtu() {
		return this._mtu;
	}

	public constructor(peripheral: Peripheral) {
		super();

		this.peripheral = peripheral;
	}

	public toString() {
		return JSON.stringify({
			mtu: this.mtu,
			peripheralUUID: this.peripheral.uuid
		});
	}

	/**
	 * Discover all services of this GATT server.
	 */
	public async discoverServices(): Promise<GattServiceRemote[]> {
		const services = await this.doDiscoverServices();
		for (const service of services) {
			this.services.set(service.uuid, service);
		}
		return [...this.services.values()];
	}
	protected abstract doDiscoverServices(): Promise<GattServiceRemote[]>;

	/**
	 * Discover all the characteristics of the specified {@link GattServiceRemote}.
	 * You can also use {@link GattServiceRemote.discoverCharacteristics}.
	 * @param serviceUUID The UUID of the {@link GattServiceRemote}.
	 */
	public abstract discoverCharacteristics(serviceUUID: string): Promise<GattCharacteristicRemote[]>;

	/**
	 * Read the value of the specified {@link GattCharacteristicRemote}.
	 * You can also use {@link GattCharacteristicRemote.read}.
	 * @param serviceUUID The UUID of the {@link GattServiceRemote}.
	 * @param characteristicUUID The UUID of the {@link GattCharacteristicRemote}.
	 */
	public abstract read(serviceUUID: string, characteristicUUID: string): Promise<Buffer>;
	/**
	 * Write the specified Buffer to the specified {@link GattCharacteristicRemote}.
	 * You can also use {@link GattCharacteristicRemote.write}.
	 * @param serviceUUID The UUID of the {@link GattServiceRemote}.
	 * @param characteristicUUID The UUID of the {@link GattCharacteristicRemote}.
	 * @param data The data that is written to the characteristic.
	 * @param withoutResponse Do not require a response from the remote GATT server for this write.
	 */
	public abstract write(
		serviceUUID: string,
		characteristicUUID: string,
		data: Buffer,
		withoutResponse: boolean
	): Promise<void>;
	public abstract broadcast(serviceUUID: string, characteristicUUID: string, broadcast: boolean): Promise<void>;
	public abstract notify(serviceUUID: string, characteristicUUID: string, notify: boolean): Promise<void>;
	/**
	 * Discover all descriptors of the specified {@link GattCharacteristicRemote}.
	 * You can also use {@link GattCharacteristicRemote.discoverDescriptors}.
	 * @param serviceUUID The UUID of the {@link GattServiceRemote}.
	 * @param characteristicUUID The UUID of the {@link GattCharacteristicRemote}.
	 */
	public abstract discoverDescriptors(serviceUUID: string, characteristicUUID: string): Promise<GattDescriptorRemote[]>;

	/**
	 * Read the value of the specified {@link GattDescriptorRemote}.
	 * You can also use {@link GattDescriptorRemote.readValue}.
	 * @param serviceUUID The UUID of the {@link GattServiceRemote}.
	 * @param characteristicUUID The UUID of the {@link GattCharacteristicRemote}.
	 * @param descriptorUUID The UUID of the {@link GattDescriptorRemote}.
	 */
	public abstract readValue(serviceUUID: string, characteristicUUID: string, descriptorUUID: string): Promise<Buffer>;
	/**
	 * Writes the specified Buffer to the specified {@link GattDescriptorRemote}.
	 * You can also use {@link GattDescriptorRemote.writeValue}.
	 * @param serviceUUID The UUID of the {@link GattServiceRemote}.
	 * @param characteristicUUID The UUID of the {@link GattCharacteristicRemote}.
	 * @param descriptorUUID The UUID of the {@link GattDescriptorRemote}.
	 * @param data The data to write.
	 */
	public abstract writeValue(
		serviceUUID: string,
		characteristicUUID: string,
		descriptorUUID: string,
		data: Buffer
	): Promise<void>;
}
