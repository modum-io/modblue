import { inspect } from 'util';

import { Adapter } from '../Adapter';
import { CUSTOM, InspectOptionsStylized } from '../Inspect';

import { Gatt } from './Gatt';
import { GattService } from './Service';

/**
 * A local GATT server.
 */
export abstract class GattLocal extends Gatt {
	/**
	 * The adapter that this GATT server belongs to.
	 */
	public readonly adapter: Adapter;

	public get isRemote(): boolean {
		return false;
	}

	public constructor(adapter: Adapter, mtu?: number, services?: GattService[]) {
		super(mtu, services);

		this.adapter = adapter;

		if (services) {
			for (const service of services) {
				this.services.set(service.uuid, service);
			}
		}
	}

	/**
	 * Adds a new service to this GATT server.
	 */
	public abstract addService(uuid: string): Promise<GattService>;

	/**
	 * Prepares this GATT server for advertisement.
	 * @param deviceName The name of this device as specified in the general service / characteristic.
	 */
	public abstract prepare(deviceName: string): Promise<void>;

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
