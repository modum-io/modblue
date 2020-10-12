import { Peripheral } from '../../models';

import { HciAdapter } from './Adapter';
import { HciGattRemote } from './gatt';
import { Hci, Signaling } from './misc';

export class HciPeripheral extends Peripheral {
	public adapter: HciAdapter;

	private hci: Hci;
	private gatt: HciGattRemote;
	private handle: number;
	private signaling: Signaling;

	public async connect(): Promise<void> {
		this._state = 'connecting';
		await this.adapter.connect(this);
	}
	public async onConnect(hci: Hci, handle: number) {
		this.handle = handle;

		this.hci = hci;

		this.signaling = new Signaling(this.hci, this.handle);
		this.signaling.on('connectionParameterUpdateRequest', this.onConnectionParameterUpdateRequest);

		this._state = 'connected';
	}

	private onConnectionParameterUpdateRequest = (
		minInterval: number,
		maxInterval: number,
		latency: number,
		supervisionTimeout: number
	) => {
		this.hci.connUpdateLe(this.handle, minInterval, maxInterval, latency, supervisionTimeout);
	};

	public async disconnect(): Promise<number> {
		this._state = 'disconnecting';
		return this.adapter.disconnect(this);
	}
	public onDisconnect() {
		this.signaling.off('connectionParameterUpdateRequest', this.onConnectionParameterUpdateRequest);
		this.signaling.dispose();
		this.signaling = null;

		this.hci = null;
		this.gatt = null;

		this.handle = null;
		this._state = 'disconnected';
	}

	public async setupGatt(requestMtu?: number): Promise<HciGattRemote> {
		if (this.gatt) {
			return this.gatt;
		}

		this.gatt = new HciGattRemote(this, this.hci);

		await this.gatt.exchangeMtu(requestMtu || 256);

		return this.gatt;
	}
}
