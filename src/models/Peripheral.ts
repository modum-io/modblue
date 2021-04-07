import { inspect } from 'util';

import { Adapter } from './Adapter';
import { AddressType } from './AddressType';
import { Gatt } from './gatt';
import { CUSTOM, InspectOptionsStylized } from './Inspect';

/**
 * The current state of the peripheral.
 */
export type PeripheralState = 'connecting' | 'connected' | 'disconnecting' | 'disconnected';

/**
 * Connection options used to establish the BLE connection.
 * Certain options are only supported on certain platforms / bindings.
 */
export interface ConnectOptions {
	/**
	 * The requested MTU that is sent during the MTU negotiation. Actual mtu may be lower.
	 */
	mtu?: number;
	/**
	 * The minimum connection interval.
	 */
	minInterval?: number;
	/**
	 * The maximum connection interval
	 */
	maxInterval?: number;
	/**
	 * The connection latency.
	 */
	latency?: number;
	/**
	 * The supervision timeout.
	 */
	supervisionTimeout?: number;
}

/**
 * Represents a peripheral that was found during scanning.
 */
export abstract class Peripheral {
	/**
	 * The adapter that this peripheral was found by.
	 */
	public readonly adapter: Adapter;

	/**
	 * The remote gatt server. Only available after connecting.
	 */
	protected _gatt: Gatt;
	public get gatt(): Gatt {
		if (this.state !== 'connected') {
			throw new Error('GATT is only available when connected');
		}
		return this._gatt;
	}

	/**
	 * The unique identifier for this peripheral.
	 */
	public readonly uuid: string;
	/**
	 * The advertised name of the peripheral.
	 */
	public readonly name: string;
	/**
	 * The MAC address type of this peripheral.
	 */
	public readonly addressType: AddressType;
	/**
	 * The MAC address of this peripheral. All lowercase, with colon separator between bytes, e.g. 11:22:33:aa:bb:cc
	 */
	public readonly address: string;

	/**
	 * Any advertisement data received from the peripheral. Usually a buffer.
	 */
	public advertisement: Record<string, unknown>;
	/**
	 * The current RSSI signal strength of the peripheral.
	 */
	public rssi: number;

	protected _state: PeripheralState;
	/**
	 * The current state of the peripheral.
	 */
	public get state(): PeripheralState {
		return this._state;
	}

	public constructor(
		adapter: Adapter,
		uuid: string,
		name: string,
		addressType: AddressType,
		address: string,
		advertisement?: Record<string, unknown>,
		rssi?: number
	) {
		this.adapter = adapter;
		this.uuid = uuid;
		this.name = name;
		this.addressType = addressType;
		this.address = address;

		this.advertisement = advertisement;
		this.rssi = rssi;

		this._state = 'disconnected';
	}

	/**
	 * Connect to this peripheral and setup GATT. Throws an error when connecting fails.
	 * Some connection settings may not be supported on certain platforms and wil be ignored.
	 * @param options The connection options.
	 */
	public abstract connect(options?: ConnectOptions): Promise<Gatt>;

	/**
	 * Disconnect from this peripheral. Does nothing if not connected. This method **never** throws an error.
	 * When connecting to a peripheral you should always wrap your calls in try-catch-finally and call this method at the end.
	 * ```
	 * try {
	 *   peripheral.connect()
	 * } catch (err) {
	 *   ...
	 * } finally {
	 *   peripheral.disconnect();
	 * }```
	 */
	public abstract disconnect(): Promise<void>;

	public toString(): string {
		return JSON.stringify(this.toJSON());
	}

	public toJSON(): Record<string, unknown> {
		return {
			uuid: this.uuid,
			address: this.address,
			addressType: this.addressType,
			rssi: this.rssi,
			state: this._state,
			adapter: this.adapter
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
