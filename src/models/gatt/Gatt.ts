import { inspect } from 'util';

import { Adapter } from '../Adapter';
import { CUSTOM, InspectOptionsStylized } from '../Inspect';
import { Peripheral } from '../Peripheral';

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
	 * Local only: Adds a new service to this GATT server.
	 */
	public abstract addService(uuid: string): Promise<GattService>;

	/**
	 * Local only: Prepares this GATT server for advertisement.
	 * This assumes that no further changes to the services or characteristics will happen.
	 * @param deviceName The name of this device. Also used in the advertisement.
	 */
	public abstract prepare(deviceName: string): Promise<void>;

	/**
	 * Remote only: Discover all services of this GATT server.
	 */
	public abstract discoverServices(): Promise<GattService[]>;

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
