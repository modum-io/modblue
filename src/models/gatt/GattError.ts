import { Peripheral } from '../Peripheral';

export class GattError extends Error {
	public readonly peripheral: Peripheral;

	public constructor(peripheral: Peripheral, message: string) {
		super(message);

		this.name = 'GattError';
		this.peripheral = peripheral;
	}
}
