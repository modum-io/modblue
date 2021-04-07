import { inspect } from 'util';

import { CUSTOM, InspectOptionsStylized } from '../Inspect';

import { GattCharacteristic } from './Characteristic';

/**
 * Represents a GATT Descriptor.
 */
export abstract class GattDescriptor {
	private value: Buffer;

	/**
	 * The GATT characteristic that this descriptor belongs to
	 */
	public readonly characteristic: GattCharacteristic;

	/**
	 * The UUID of this descriptor, no dashes (-).
	 */
	public readonly uuid: string;

	/**
	 * True if this is a remote characteristic, false otherwise.
	 */
	public readonly isRemote: boolean;

	public constructor(characteristic: GattCharacteristic, uuid: string, isRemote: boolean, value?: Buffer) {
		this.characteristic = characteristic;
		this.uuid = uuid;
		this.isRemote = isRemote;

		this.value = value;
	}

	/**
	 * Read the current value of this descriptor.
	 */
	public abstract read(): Promise<Buffer>;

	/**
	 * Writes the specified data to this descriptor.
	 * @param data The data to write.
	 */
	public abstract write(data: Buffer): Promise<void>;

	public async handleRead(offset: number): Promise<Buffer> {
		if (this.isRemote) {
			throw new Error('Can only be used for local descriptors');
		}

		return this.value.slice(offset);
	}

	public async handleWrite(offset: number, data: Buffer): Promise<number> {
		if (this.isRemote) {
			throw new Error('Can only be used for local descriptors');
		}
		if (offset) {
			throw new Error('Writing offset for discriptors is not supported');
		}

		this.value = data;
		return 0;
	}

	public toString(): string {
		return JSON.stringify(this.toJSON());
	}

	public toJSON(): Record<string, unknown> {
		return {
			uuid: this.uuid,
			characteristic: this.characteristic
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
