import { inspect, InspectOptionsStylized } from 'util';

import { GattCharacteristic } from './Characteristic';

/**
 * Represents a GATT Descriptor.
 */
export abstract class GattDescriptor {
	/**
	 * The GATT characteristic that this descriptor belongs to
	 */
	public readonly characteristic: GattCharacteristic;

	/**
	 * The UUID of this descriptor.
	 */
	public readonly uuid: string;

	public constructor(characteristic: GattCharacteristic, uuid: string) {
		this.characteristic = characteristic;

		this.uuid = uuid;
	}

	public toString() {
		return JSON.stringify(this.toJSON());
	}

	public toJSON() {
		return {
			uuid: this.uuid,
			characteristic: this.characteristic
		};
	}

	public [inspect.custom](depth: number, options: InspectOptionsStylized) {
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
