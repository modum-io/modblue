import { inspect } from 'util';

import { CUSTOM, InspectOptionsStylized } from '../Inspect';

import { GattCharacteristic, GattCharacteristicProperty, ReadFunction, WriteFunction } from './Characteristic';
import { Gatt } from './Gatt';

/**
 * Represents a GATT service.
 */
export abstract class GattService {
	/**
	 * The GATT server this service belongs to.
	 */
	public readonly gatt: Gatt;

	/**
	 * The UUID of this service, no dashes (-).
	 */
	public readonly uuid: string;

	/**
	 * True if this is a remote service, false otherwise.
	 */
	public readonly isRemote: boolean;

	/**
	 * The characteristics that belong to this service, mapped by UUID.
	 * If this is a remote service use {@link discoverCharacteristics} to discover them.
	 */
	public readonly characteristics: Map<string, GattCharacteristic> = new Map();

	public constructor(gatt: Gatt, uuid: string, isRemote: boolean) {
		this.gatt = gatt;
		this.uuid = uuid;
		this.isRemote = isRemote;
	}

	/**
	 * Local only: Add a new characteristic to this service
	 */
	public abstract addCharacteristic(
		uuid: string,
		props: GattCharacteristicProperty[],
		secure: GattCharacteristicProperty[],
		value?: Buffer
	): Promise<GattCharacteristic>;

	/**
	 * Local only: Add a new characteristic to this service
	 */
	public abstract addCharacteristic(
		uuid: string,
		props: GattCharacteristicProperty[],
		secure: GattCharacteristicProperty[],
		readFunc?: ReadFunction,
		writeFunc?: WriteFunction
	): Promise<GattCharacteristic>;

	/**
	 * Remote only: Discover all charactersitics of this service.
	 */
	public abstract discoverCharacteristics(): Promise<GattCharacteristic[]>;

	public toString(): string {
		return JSON.stringify(this.toJSON());
	}

	public toJSON(): Record<string, unknown> {
		return {
			uuid: this.uuid,
			gatt: this.gatt
		};
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
