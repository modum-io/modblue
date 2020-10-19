import { Peripheral } from '../../models';

import { HciAdapter } from './Adapter';
import { HciGattRemote } from './gatt';
import { Hci, Signaling } from './misc';

export class HciPeripheral extends Peripheral {
	public adapter: HciAdapter;

	private hci: Hci;
	private gatt: HciGattRemote;
	private mtuExchanged: boolean;
	private handle: number;
	private signaling: Signaling;

	public async connect(): Promise<void> {
		this._state = 'connecting';
		await this.adapter.connect(this);
	}
	public async onConnect(hci: Hci, handle: number) {
		this.hci = hci;
		this.handle = handle;

		this.signaling = new Signaling(hci, handle);
		this.signaling.on('connectionParameterUpdateRequest', this.onConnectionParameterUpdateRequest);

		this.gatt = new HciGattRemote(this, hci, handle);
		await this.gatt.exchangeMtu(256);
		this.mtuExchanged = true;

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

		this.gatt.dispose();
		this.gatt = null;

		this.hci = null;

		this.handle = null;
		this._state = 'disconnected';
	}

	public async setupGatt(requestMtu?: number): Promise<HciGattRemote> {
		if (this.state !== 'connected' || !this.handle) {
			throw new Error(`Peripheral is not connected`);
		}

		/*if (!this.mtuExchanged) {
			await this.gatt.exchangeMtu(requestMtu || 256);
			this.mtuExchanged = true;
		}*/

		return this.gatt;
	}
}
