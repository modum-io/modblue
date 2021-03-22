import { inspect } from 'util';

import { CUSTOM, InspectOptionsStylized } from '../Inspect';

import { GattCharacteristic } from './Characteristic';
import { Gatt } from './Gatt';

/**
 * Represents a GATT service.
 */
export class GattService {
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

	public constructor(gatt: Gatt, uuid: string, isRemote: boolean, characteristics?: GattCharacteristic[]) {
		this.gatt = gatt;
		this.uuid = uuid;
		this.isRemote = isRemote;

		if (characteristics) {
			for (const char of characteristics) {
				this.characteristics.set(char.uuid, char);
			}
		}
	}

	/**
	 * Discover all charactersitics of this service.
	 */
	public async discoverCharacteristics(): Promise<GattCharacteristic[]> {
		if (!this.isRemote) {
			throw new Error('Ĉannot discover characteristics of a local service');
		}

		const characteristics = await this.gatt.discoverCharacteristics(this.uuid);
		for (const characteristic of characteristics) {
			this.characteristics.set(characteristic.uuid, characteristic);
		}
		return [...this.characteristics.values()];
	}

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
