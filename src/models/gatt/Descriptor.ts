import { inspect } from 'util';

import { CUSTOM, InspectOptionsStylized } from '../Inspect';

import { GattCharacteristic } from './Characteristic';
import { Gatt } from './Gatt';

/**
 * Represents a GATT Descriptor.
 */
export class GattDescriptor {
	private value: Buffer;
	private get gatt(): Gatt {
		return this.characteristic.service.gatt;
	}

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
	public read(): Promise<Buffer> {
		if (!this.isRemote) {
			throw new Error('Can only be used for remote descriptors');
		}

		return this.gatt.readDescriptor(this.characteristic.service.uuid, this.characteristic.uuid, this.uuid);
	}

	/**
	 * Writes the specified data to this descriptor.
	 * @param data The data to write.
	 */
	public write(data: Buffer): Promise<void> {
		if (!this.isRemote) {
			throw new Error('Can only be used for remote descriptors');
		}

		return this.gatt.writeDescriptor(this.characteristic.service.uuid, this.characteristic.uuid, this.uuid, data);
	}

	public async handleRead(offset: number): Promise<[number, Buffer]> {
		if (this.isRemote) {
			throw new Error('Can only be used for local descriptors');
		}

		return [0, this.value.slice(offset)];
	}

	public async handleWrite(offset: number, data: Buffer): Promise<number> {
		if (this.isRemote) {
			throw new Error('Can only be used for local descriptors');
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
