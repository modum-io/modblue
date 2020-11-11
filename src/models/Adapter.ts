import { TypedEmitter } from 'tiny-typed-emitter';

import { AddressType } from '../types';

import { GattLocal } from './gatt';
import { Noble } from './Noble';
import { Peripheral } from './Peripheral';

export interface AdapterEvents {
	discover: (peripheral: Peripheral) => void;
	connect: (peripheral: Peripheral) => void;
	disconnect: (peripheral: Peripheral, reason?: number) => void;
}

export abstract class Adapter extends TypedEmitter<AdapterEvents> {
	/**
	 * The instance of noble that this adapter was found by.
	 */
	public readonly noble: Noble;

	/**
	 * The unique identifier of this adapter.
	 */
	public readonly id: string;

	protected _name: string;
	/**
	 * The public name of this adapter.
	 */
	public get name() {
		return this._name;
	}

	protected _addressType: AddressType;
	/**
	 * The MAC address type of this adapter.
	 */
	public get addressType() {
		return this._addressType;
	}

	protected _address: string;
	/**
	 * The MAC address of this adapter.
	 */
	public get address() {
		return this._address;
	}

	public constructor(noble: Noble, id: string, name?: string, address?: string) {
		super();

		this.noble = noble;
		this.id = id;
		this._name = name || `hci${id.replace('hci', '')}`;
		this._address = address;
	}

	public toString() {
		return JSON.stringify({
			id: this.id,
			name: this.name,
			address: this.address
		});
	}

	/**
	 * Scans for a specific {@link Peripheral} using the specified matching function and returns the peripheral once found.
	 * If the timeout is reached before finding a peripheral the returned promise will be rejected.
	 * @param isTarget A function that returns `true` if the specified peripheral is the peripheral we're looking for.
	 * @param timeoutInSeconds The timeout in seconds. The returned promise will reject once the timeout is reached.
	 * @param serviceUUIDs The UUIDs of the {@link GattServiceRemote}s that must be contained in the advertisement data.
	 */
	public async scanFor(
		isTarget: (peripheral: Peripheral) => boolean,
		timeoutInSeconds: number = 10,
		serviceUUIDs?: []
	) {
		let onDiscover: (peripheral: Peripheral) => void;

		const scan = new Promise<Peripheral>((resolve) => {
			onDiscover = (peripheral: Peripheral) => {
				if (isTarget(peripheral)) {
					this.off('discover', onDiscover);
					resolve(peripheral);
				}
			};
			this.on('discover', onDiscover);
		});

		await this.startScanning(serviceUUIDs, true);

		const timeout = new Promise<undefined>((_, reject) =>
			setTimeout(() => reject(`Scan timed out`), timeoutInSeconds * 1000)
		);

		try {
			const res = await Promise.race([scan, timeout]);
			await this.stopScanning();

			return res;
		} catch (err) {
			this.off('discover', onDiscover);
			await this.stopScanning();

			throw err;
		}
	}

	/**
	 * Returns `true` if this adapter is currently scanning, `false` otherwise.
	 */
	public abstract isScanning(): Promise<boolean>;

	/**
	 * Start scanning for nearby {@link Peripheral}s.
	 * @param serviceUUIDs The UUIDs of the {@link GattServiceRemote} that an advertising
	 * packet must advertise to emit a `discover` event.
	 * @param allowDuplicates True if advertisements for the same peripheral should emit multiple `discover` events.
	 */
	public abstract startScanning(serviceUUIDs?: string[], allowDuplicates?: boolean): Promise<void>;
	/**
	 * Stop scanning for peripherals.
	 */
	public abstract stopScanning(): Promise<void>;

	/**
	 * Get all peripherals that were found since the last scan start.
	 */
	public abstract getScannedPeripherals(): Promise<Peripheral[]>;

	/**
	 * Start advertising on this adapter.
	 * @param deviceName The device name that is included in the advertisement.
	 * @param serviceUUIDs The UUIDs of the {@link GattServiceLocal}s that are included in the advertisement.
	 */
	public abstract startAdvertising(deviceName: string, serviceUUIDs?: string[]): Promise<void>;
	/**
	 * Stop any ongoing advertisements.
	 */
	public abstract stopAdvertising(): Promise<void>;

	/**
	 * Setup the GATT server for this adapter to communicate with connecting remote peripherals.
	 * @param maxMtu The maximum MTU that will be negotiated in case the remote peripheral starts an MTU negotation.
	 */
	public abstract setupGatt(maxMtu?: number): Promise<GattLocal>;
}
