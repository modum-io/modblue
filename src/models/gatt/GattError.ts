import { Peripheral } from '../Peripheral';

export class GattError extends Error {
	public readonly peripheral: Peripheral;
	public readonly details?: string;

	public constructor(peripheral: Peripheral, message: string, details?: string) {
		super(message);

		this.name = 'GattError';
		this.peripheral = peripheral;
		this.details = details;
	}
}
