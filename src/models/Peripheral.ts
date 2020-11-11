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

	public toString() {
		return JSON.stringify({
			uuid: this.uuid,
			address: this.address,
			addressType: this.addressType,
			advertisement: this.advertisement,
			rssi: this.rssi,
			state: this._state
		});
	}

	/**
	 * Connect to this peripheral. Does nothing if already connected.
	 */
	public abstract connect(): Promise<void>;
	/**
	 * Disconnect from this peripheral. Does nothing if not connected.
	 */
	public abstract disconnect(): Promise<void>;

	/**
	 * Setup the local GATT server to send and receive data from the remote GATT server of the peripheral.
	 * Requires an existing connection.
	 * @param requestMtu The requested MTU that is sent during the MTU negotiation. Actual mtu may be lower.
	 */
	public abstract setupGatt(requestMtu?: number): Promise<GattRemote>;
}
