import { inspect, InspectOptionsStylized } from 'util';

import { AddressType } from '../types';

import { Adapter } from './Adapter';
import { GattRemote } from './gatt';

/**
 * The current state of the peripheral.
 */
export type PeripheralState = 'connecting' | 'connected' | 'disconnecting' | 'disconnected';

/**
 * Represents a peripheral that was found during scanning.
 */
export abstract class Peripheral {
	/**
	 * The adapter that this peripheral was found by.
	 */
	public readonly adapter: Adapter;

	/**
	 * The unique identifier for this peripheral.
	 */
	public readonly uuid: string;
	/**
	 * The MAC address type of this peripheral.
	 */
	public readonly addressType: AddressType;
	/**
	 * The MAC address of this peripheral.
	 */
	public readonly address: string;

	/**
	 * Any advertisement data received from the peripheral. Usually a buffer.
	 */
	public advertisement: any;
	/**
	 * The current RSSI signal strength of the peripheral.
	 */
	public rssi: number;

	protected _state: PeripheralState;
	/**
	 * The current state of the peripheral.
	 */
	public get state() {
		return this._state;
	}

	public constructor(
		adapter: Adapter,
		uuid: string,
		addressType: AddressType,
		address: string,
		advertisement?: any,
		rssi?: number
	) {
		this.adapter = adapter;
		this.uuid = uuid;
		this.addressType = addressType;
		this.address = address;

		this.advertisement = advertisement;
		this.rssi = rssi;

		this._state = 'disconnected';
	}

	/**
	 * Connect to this peripheral. Throws an error when connecting fails.
	 */
	public abstract connect(): Promise<void>;
	/**
	 * Disconnect from this peripheral. Does nothing if not connected. This method **never** throws an error.
	 * When connecting to a peripheral you should always wrap your calls in try-catch and call this method at the end.
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

	/**
	 * Setup the local GATT server to send and receive data from the remote GATT server of the peripheral.
	 * Requires an existing connection.
	 * @param requestMtu The requested MTU that is sent during the MTU negotiation. Actual mtu may be lower.
	 */
	public abstract setupGatt(requestMtu?: number): Promise<GattRemote>;

	public toString() {
		return JSON.stringify(this.toJSON());
	}

	public toJSON() {
		return {
			uuid: this.uuid,
			address: this.address,
			addressType: this.addressType,
			rssi: this.rssi,
			state: this._state,
			adapter: this.adapter
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
