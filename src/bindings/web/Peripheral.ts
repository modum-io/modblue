import { Gatt, Peripheral } from '../../models';

import { WebAdapter } from './Adapter';

export class WebPeripheral extends Peripheral {
	public adapter: WebAdapter;

	public constructor(adapter: WebAdapter, id: string, advertisement: Record<string, unknown>, rssi: number) {
		super(adapter, id, 'unknown', null, advertisement, rssi);
	}

	public connect(
		minInterval?: number,
		maxInterval?: number,
		latency?: number,
		supervisionTimeout?: number
	): Promise<void> {
		throw new Error('Method not implemented.');
	}

	public disconnect(): Promise<void> {
		throw new Error('Method not implemented.');
	}

	public setupGatt(requestMtu?: number): Promise<Gatt> {
		throw new Error('Method not implemented.');
	}
}
