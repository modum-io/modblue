import { inspect, InspectOptionsStylized } from 'util';

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
	 * The UUID of this service, excluding dashes (-).
	 */
	public readonly uuid: string;

	public constructor(gatt: Gatt, uuid: string) {
		this.gatt = gatt;

		this.uuid = uuid;
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

	public [inspect.custom](depth: number, options: InspectOptionsStylized): string {
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
