import { inspect } from 'util';

import { CUSTOM, InspectOptionsStylized } from '../Inspect';

import { GattService } from './Service';

/**
 * A local or remote GATT server.
 */
export abstract class Gatt {
	/**
	 * True if this is a remote GATT server, false otherwise.
	 */
	public abstract get isRemote(): boolean;

	/**
	 * The services that belong to this GATT server, mapped by UUID.
	 * If this is a remote GATT use {@link discoverServices} to discover them.
	 */
	public readonly services: Map<string, GattService> = new Map();

	protected _mtu: number;
	/**
	 * Local: The maximum MTU that will be agreed upon during negotiation.
	 * Remote: The MTU that was agreed upon during negotiation.
	 */
	public get mtu(): number {
		return this._mtu;
	}

	public constructor(mtu?: number, services?: GattService[]) {
		this._mtu = mtu;

		if (services) {
			for (const service of services) {
				this.services.set(service.uuid, service);
			}
		}
	}

	public toString(): string {
		return JSON.stringify(this.toJSON());
	}

	public toJSON(): Record<string, unknown> {
		return {
			mtu: this.mtu,
			services: this.services.size
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
