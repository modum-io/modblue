import { TypedEmitter } from 'tiny-typed-emitter';
import { inspect } from 'util';

import { CUSTOM, InspectOptionsStylized } from '../Inspect';

import { GattDescriptor } from './Descriptor';
import { Gatt } from './Gatt';
import { GattService } from './Service';

export type ReadFunction = (offset: number) => Promise<[number, Buffer]>;
export type WriteFunction = (offset: number, data: Buffer, withoutResponse: boolean) => Promise<number>;

export type GattCharacteristicProperty =
	| 'broadcast'
	| 'read'
	| 'write-without-response'
	| 'write'
	| 'notify'
	| 'indicate'
	| 'authenticated-signed-writes'
	| 'extended-properties'
	| 'reliable-write'
	| 'writable-auxiliaries'
	| 'authorize';

export interface GattCharacteristicEvents {
	notification: (data: Buffer) => void;
}

/**
 * Represents a GATT Characteristic.
 */
export class GattCharacteristic extends TypedEmitter<GattCharacteristicEvents> {
	private readonly readFunc: ReadFunction;
	private readonly writeFunc: WriteFunction;
	private get gatt(): Gatt {
		return this.service.gatt;
	}

	/**
	 * The GATT service that this characteristic belongs to.
	 */
	public readonly service: GattService;

	/**
	 * The UUID of this characteristic, no dashes (-).
	 */
	public readonly uuid: string;

	/**
	 * True if this is a remote characteristic, false otherwise.
	 */
	public readonly isRemote: boolean;

	/**
	 * A list of all the properties that are enabled/supported for this characteristic.
	 */
	public readonly properties: GattCharacteristicProperty[];

	/**
	 * The list of properties supported by this characteristic as a byte flag per the Bluetooth Core spec.
	 */
	public readonly propertyFlag: number;

	/**
	 * A list of all the properties on this characteristic that are secured.
	 */
	public readonly secure: GattCharacteristicProperty[];

	/**
	 * The list of all secured properties of this characteristic as a byte flag per the Bluetooth Core spec.
	 */
	public readonly secureFlag: number;

	/**
	 * The descriptors that belong to this characteristic, mapped by UUID.
	 * If this is a remote characteristic use {@link discoverDescriptors} to discover them.
	 */
	public readonly descriptors: Map<string, GattDescriptor> = new Map();

	public constructor(
		service: GattService,
		uuid: string,
		isRemote: boolean,
		propsOrFlag: number | GattCharacteristicProperty[],
		secureOrFlag: number | GattCharacteristicProperty[],
		readFunc?: ReadFunction,
		writeFunc?: WriteFunction,
		descriptors?: GattDescriptor[]
	) {
		super();

		this.service = service;
		this.uuid = uuid;
		this.isRemote = isRemote;

		let properties: GattCharacteristicProperty[] = [];
		let secure: GattCharacteristicProperty[] = [];
		let propertyFlag = 0;
		let secureFlag = 0;

		if (typeof propsOrFlag === 'object') {
			properties = propsOrFlag;

			if (propsOrFlag.includes('read')) {
				propertyFlag |= 0x02;
			}
			if (propsOrFlag.includes('write-without-response')) {
				propertyFlag |= 0x04;
			}
			if (propsOrFlag.includes('write')) {
				propertyFlag |= 0x08;
			}
			if (propsOrFlag.includes('notify')) {
				propertyFlag |= 0x10;
			}
			if (propsOrFlag.includes('indicate')) {
				propertyFlag |= 0x20;
			}
		} else {
			propertyFlag = propsOrFlag;

			if (propsOrFlag & 0x01) {
				properties.push('broadcast');
			}
			if (propsOrFlag & 0x02) {
				properties.push('read');
			}
			if (propsOrFlag & 0x04) {
				properties.push('write-without-response');
			}
			if (propsOrFlag & 0x08) {
				properties.push('write');
			}
			if (propsOrFlag & 0x10) {
				properties.push('notify');
			}
			if (propsOrFlag & 0x20) {
				properties.push('indicate');
			}
			if (propsOrFlag & 0x40) {
				properties.push('authenticated-signed-writes');
			}
			if (propsOrFlag & 0x80) {
				properties.push('extended-properties');
			}
		}

		if (typeof secureOrFlag === 'object') {
			secure = secureOrFlag;

			if (secureOrFlag.includes('read')) {
				secureFlag |= 0x02;
			}
			if (secureOrFlag.includes('write-without-response')) {
				secureFlag |= 0x04;
			}
			if (secureOrFlag.includes('write')) {
				secureFlag |= 0x08;
			}
			if (secureOrFlag.includes('notify')) {
				secureFlag |= 0x10;
			}
			if (secureOrFlag.includes('indicate')) {
				secureFlag |= 0x20;
			}
		} else {
			secureFlag = secureOrFlag;

			if (secureOrFlag & 0x01) {
				secure.push('broadcast');
			}
			if (secureOrFlag & 0x02) {
				secure.push('read');
			}
			if (secureOrFlag & 0x04) {
				secure.push('write-without-response');
			}
			if (secureOrFlag & 0x08) {
				secure.push('write');
			}
			if (secureOrFlag & 0x10) {
				secure.push('notify');
			}
			if (secureOrFlag & 0x20) {
				secure.push('indicate');
			}
			if (secureOrFlag & 0x40) {
				secure.push('authenticated-signed-writes');
			}
			if (secureOrFlag & 0x80) {
				secure.push('extended-properties');
			}
		}

		this.properties = properties;
		this.secure = secure;
		this.propertyFlag = propertyFlag;
		this.secureFlag = secureFlag;

		this.readFunc = readFunc;
		this.writeFunc = writeFunc;

		if (descriptors) {
			for (const descriptor of descriptors) {
				this.descriptors.set(descriptor.uuid, descriptor);
			}
		}
	}

	/**
	 * Discover all descriptors of this characteristic.
	 */
	public async discoverDescriptors(): Promise<GattDescriptor[]> {
		if (!this.isRemote) {
			throw new Error('Can only be used for remote characteristic');
		}

		const descriptors = await this.gatt.discoverDescriptors(this.service.uuid, this.uuid);
		for (const descriptor of descriptors) {
			this.descriptors.set(descriptor.uuid, descriptor);
		}
		return [...this.descriptors.values()];
	}

	/**
	 * Read the current value of this characteristic.
	 */
	public async read(): Promise<Buffer> {
		if (!this.isRemote) {
			throw new Error('Can only be used for remote characteristic');
		}

		return this.gatt.readCharacteristic(this.service.uuid, this.uuid);
	}

	/**
	 * Write the specified data to this characteristic.
	 * @param data The data to write.
	 * @param withoutResponse Do not require a response from the remote GATT server for this write.
	 */
	public async write(data: Buffer, withoutResponse: boolean): Promise<void> {
		if (!this.isRemote) {
			throw new Error('Can only be used for remote characteristic');
		}

		await this.gatt.writeCharacteristic(this.service.uuid, this.uuid, data, withoutResponse);
	}

	/**
	 * Enable or disable broadcasts.
	 * @param broadcast True to enable broadcasts, false otherwise.
	 */
	public async broadcast(broadcast: boolean): Promise<void> {
		if (!this.isRemote) {
			throw new Error('Can only be used for remote characteristic');
		}

		await this.gatt.broadcastCharacteristic(this.service.uuid, this.uuid, broadcast);
	}

	/**
	 * Enable or disable notifications.
	 * @param notify True to enable notifies, false otherwise.
	 */
	public async notify(notify: boolean): Promise<void> {
		if (!this.isRemote) {
			throw new Error('Can only be used for remote characteristic');
		}

		await this.gatt.notifyCharacteristic(this.service.uuid, this.uuid, notify);
	}

	/**
	 * Enable notifications. Equivalent to calling {@link notify} with `true`.
	 */
	public async subscribe(): Promise<void> {
		if (!this.isRemote) {
			throw new Error('Can only be used for remote characteristic');
		}

		await this.notify(true);
	}

	/**
	 * Disable nofitications. Equivalent to calling {@link notify} with `false`.
	 */
	public async unsubscribe(): Promise<void> {
		if (!this.isRemote) {
			throw new Error('Can only be used for remote characteristic');
		}

		await this.notify(false);
	}

	public async handleRead(offset: number): Promise<[number, Buffer]> {
		if (this.isRemote) {
			throw new Error('Can only be used for local characteristic');
		}

		return this.readFunc(offset);
	}

	public async handleWrite(offset: number, data: Buffer, withoutResponse: boolean): Promise<number> {
		if (this.isRemote) {
			throw new Error('Can only be used for local characteristic');
		}

		return this.writeFunc(offset, data, withoutResponse);
	}

	public toString(): string {
		return JSON.stringify(this.toJSON());
	}

	public toJSON(): Record<string, unknown> {
		return {
			uuid: this.uuid,
			properties: this.properties,
			secure: this.secure,
			service: this.service
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
