import { TypedEmitter } from 'tiny-typed-emitter';
import { inspect } from 'util';

import { AddressType } from './AddressType';
import { Gatt } from './gatt';
import { CUSTOM, InspectOptionsStylized } from './Inspect';
import { MODblue } from './MODblue';
import { Peripheral } from './Peripheral';

export interface AdapterEvents {
	discover: (peripheral: Peripheral) => void;
	connect: (peripheral: Peripheral) => void;
	disconnect: (peripheral: Peripheral, reason?: string) => void;
	error: (error: Error) => void;
}

export abstract class Adapter extends TypedEmitter<AdapterEvents> {
	/**
	 * The instance of MODblue that this adapter was found by.
	 */
	public readonly modblue: MODblue;

	/**
	 * The unique identifier of this adapter.
	 */
	public readonly id: string;

	protected _name: string;
	/**
	 * The public name of this adapter.
	 */
	public get name(): string {
		return this._name;
	}

	protected _addressType: AddressType;
	/**
	 * The MAC address type of this adapter.
	 */
	public get addressType(): string {
		return this._addressType;
	}

	protected _address: string;
	/**
	 * The MAC address of this adapter. All lowercase, with colon separator between bytes, e.g. 11:22:33:aa:bb:cc
	 */
	public get address(): string {
		return this._address;
	}

	public constructor(modblue: MODblue, id: string, name?: string, address?: string) {
		super();

		this.modblue = modblue;
		this.id = id;
		this._name = name || `hci${id.replace('hci', '')}`;
		this._address = address?.toLowerCase();
	}

	/**
	 * Scans for a specific {@link Peripheral} using the specified matching function and returns the peripheral once found.
	 * If the timeout is reached before finding a peripheral the returned promise will be rejected.
	 * @param isTarget A function that returns `true` if the specified peripheral is the peripheral we're looking for.
	 * @param timeoutInSeconds The timeout in seconds. The returned promise will reject once the timeout is reached.
	 * @param serviceUUIDs The UUIDs of the {@link GattService}s that must be contained in the advertisement data.
	 */
	public async scanFor(
		isTarget: (peripheral: Peripheral) => boolean,
		timeoutInSeconds = 10,
		serviceUUIDs?: string[]
	): Promise<Peripheral> {
		const origScope = new Error();

		return new Promise<Peripheral>((resolve, reject) => {
			let timeout: NodeJS.Timeout;
			const onDiscover = (peripheral: Peripheral) => {
				if (isTarget(peripheral)) {
					resolveHandler(peripheral);
				}
			};

			const cleanup = () => {
				this.stopScanning();
				this.off('discover', onDiscover);

				if (timeout) {
					clearTimeout(timeout);
					timeout = null;
				}
			};

			const resolveHandler = (peripheral: Peripheral) => {
				cleanup();
				resolve(peripheral);
			};

			const rejectHandler = async (error?: Error) => {
				cleanup();

				if (error) {
					error.stack = error.stack + '\n' + origScope.stack;
				}

				reject(error);
			};

			this.on('discover', onDiscover);

			this.startScanning(serviceUUIDs, true).catch((err) => rejectHandler(err));

			const timeoutError = new Error(`Scanning timed out`);
			timeout = setTimeout(() => rejectHandler(timeoutError), timeoutInSeconds * 1000);
		});
	}

	/**
	 * Returns `true` if this adapter is currently scanning, `false` otherwise.
	 */
	public abstract isScanning(): Promise<boolean>;

	/**
	 * Start scanning for nearby {@link Peripheral}s.
	 * @param serviceUUIDs The UUIDs of the {@link GattService} that an advertising
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
	 * Returns `true` if this adapter is currently advertising, `false` otherwise.
	 */
	public abstract isAdvertising(): Promise<boolean>;

	/**
	 * Start advertising on this adapter.
	 * @param deviceName The device name that is included in the advertisement.
	 * @param serviceUUIDs The UUIDs of the {@link GattService}s that are included in the advertisement.
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
	public abstract setupGatt(maxMtu?: number): Promise<Gatt>;

	public toString(): string {
		return JSON.stringify(this.toJSON());
	}

	public toJSON(): Record<string, unknown> {
		return {
			id: this.id,
			name: this.name,
			address: this.address
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
