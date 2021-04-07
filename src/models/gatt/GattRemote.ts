import { Peripheral } from '../Peripheral';

import { Gatt } from './Gatt';
import { GattService } from './Service';

/**
 * A remote GATT server.
 */
export abstract class GattRemote extends Gatt {
	/**
	 * The peripheral that this GATT server belongs to.
	 */
	public readonly peripheral: Peripheral;

	public get isRemote(): boolean {
		return true;
	}

	public constructor(peripheral: Peripheral, mtu?: number) {
		super(mtu);

		this.peripheral = peripheral;
	}

	/**
	 * Discover all services of this GATT server.
	 */
	public abstract discoverServices(): Promise<GattService[]>;

	public toJSON(): Record<string, unknown> {
		return {
			...super.toJSON(),
			peripheral: this.peripheral
		};
	}
}
