import { inspect } from 'util';

import { Adapter } from '../Adapter';
import { CUSTOM, InspectOptionsStylized } from '../Inspect';
import { Peripheral } from '../Peripheral';

import { GattCharacteristic } from './Characteristic';
import { GattDescriptor } from './Descriptor';
import { GattService } from './Service';

/**
 * A local or remote GATT server.
 */
export abstract class Gatt {
	/**
	 * Local: undefined
	 * Remote: The peripheral that this GATT server belongs to.
	 */
	public readonly peripheral: Peripheral;

	/**
	 * Local: The adapter that this GATT server belongs to.
	 * Remote: undefined
	 */
	public readonly adapter: Adapter;

	/**
	 * True if this is a remote GATT server, false otherwise.
	 */
	public get isRemote(): boolean {
		return !!this.peripheral;
	}

	/**
	 * The services that belong to this GATT server, mapped by UUID.
	 * If this is a remote GATT use {@link discoverServices} to discover them.
	 */
	public readonly services: Map<string, GattService> = new Map();

	protected _mtu: number;
	/**
	 * Local: The maximum MTU that will agreed upon during negotiation.
	 * Remote: The MTU that was agreed upon during negotiation.
	 */
	public get mtu(): number {
		return this._mtu;
	}

	public constructor(peripheral?: Peripheral, adapter?: Adapter, mtu?: number, services?: GattService[]) {
		this.peripheral = peripheral;
		this.adapter = adapter;
		this._mtu = mtu;

		if (services) {
			for (const service of services) {
				this.services.set(service.uuid, service);
			}
		}
	}

	/**
	 * Discover all services of this GATT server.
	 */
	public async discoverServices(): Promise<GattService[]> {
		if (!this.isRemote) {
			throw new Error('Can only be used for remote GATT servers');
		}

		const services = await this.doDiscoverServices();
		for (const service of services) {
			this.services.set(service.uuid, service);
		}
		return [...this.services.values()];
	}
	protected abstract doDiscoverServices(): Promise<GattService[]>;

	/**
	 * Discover all the characteristics of the specified {@link GattService}.
	 * You can also use {@link GattService.discoverCharacteristics}.
	 * @param serviceUUID The UUID of the {@link GattService}.
	 */
	public abstract discoverCharacteristics(serviceUUID: string): Promise<GattCharacteristic[]>;

	/**
	 * Read the value of the specified {@link GattCharacteristic}.
	 * You can also use {@link GattCharacteristic.read}.
	 * @param serviceUUID The UUID of the {@link GattService}.
	 * @param characteristicUUID The UUID of the {@link GattCharacteristic}.
	 */
	public abstract readCharacteristic(serviceUUID: string, characteristicUUID: string): Promise<Buffer>;

	/**
	 * Write the specified Buffer to the specified {@link GattCharacteristic}.
	 * You can also use {@link GattCharacteristic.write}.
	 * @param serviceUUID The UUID of the {@link GattService}.
	 * @param characteristicUUID The UUID of the {@link GattCharacteristic}.
	 * @param data The data that is written to the characteristic.
	 * @param withoutResponse Do not require a response from the remote GATT server for this write.
	 */
	public abstract writeCharacteristic(
		serviceUUID: string,
		characteristicUUID: string,
		data: Buffer,
		withoutResponse: boolean
	): Promise<void>;

	public abstract broadcastCharacteristic(
		serviceUUID: string,
		characteristicUUID: string,
		broadcast: boolean
	): Promise<void>;

	public abstract notifyCharacteristic(serviceUUID: string, characteristicUUID: string, notify: boolean): Promise<void>;

	/**
	 * Discover all descriptors of the specified {@link GattCharacteristic}.
	 * You can also use {@link GattCharacteristic.discoverDescriptors}.
	 * @param serviceUUID The UUID of the {@link GattService}.
	 * @param characteristicUUID The UUID of the {@link GattCharacteristic}.
	 */
	public abstract discoverDescriptors(serviceUUID: string, characteristicUUID: string): Promise<GattDescriptor[]>;

	/**
	 * Read the value of the specified {@link GattDescriptor}.
	 * You can also use {@link GattDescriptor.read}.
	 * @param serviceUUID The UUID of the {@link GattService}.
	 * @param characteristicUUID The UUID of the {@link GattCharacteristic}.
	 * @param descriptorUUID The UUID of the {@link GattDescriptor}.
	 */
	public abstract readDescriptor(
		serviceUUID: string,
		characteristicUUID: string,
		descriptorUUID: string
	): Promise<Buffer>;

	/**
	 * Writes the specified Buffer to the specified {@link GattDescriptor}.
	 * You can also use {@link GattDescriptor.write}.
	 * @param serviceUUID The UUID of the {@link GattService}.
	 * @param characteristicUUID The UUID of the {@link GattCharacteristic}.
	 * @param descriptorUUID The UUID of the {@link GattDescriptor}.
	 * @param data The data to write.
	 */
	public abstract writeDescriptor(
		serviceUUID: string,
		characteristicUUID: string,
		descriptorUUID: string,
		data: Buffer
	): Promise<void>;

	public toString(): string {
		return JSON.stringify(this.toJSON());
	}

	public toJSON(): Record<string, unknown> {
		return {};
	}

	public [CUSTOM](depth: number, options: InspectOptionsStylized): string {
		const name = this.constructor.name;

		if (depth < 0) {
			return options.stylize(`[${name}]`, 'special');
		}

		const newOptions = { ...options, depth: options.depth === null ? null : options.depth - 1 };

		const padding = ' '.repeat(name.length + 1);
		const inner = inspect(this.toJSON(), newOptions).replace(/\n/g, `\n${padding}`);
		return `${options.stylize(name, 'special')} ${inner}`;
	}
}
