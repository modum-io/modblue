import { Peripheral } from '../../models';

import { HciAdapter } from './Adapter';
import { HciGattRemote } from './gatt';
import { Hci, Signaling } from './misc';

// 512 bytes is max char size + 1 byte att opcode + 2 bytes handle + 2 bytes offset for long writes
const DEFAULT_MTU = 517;

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

		this.hci = hci;
		this.signaling = new Signaling(this.hci, this.handle);

		this.gatt = new HciGattRemote(this, hci, handle);
		this.mtuExchanged = false;

		this._state = 'connected';
	}

	public async disconnect(): Promise<void> {
		this._state = 'disconnecting';
		await this.adapter.disconnect(this);
	}
	public async onDisconnect() {
		if (this.gatt) {
			this.gatt.dispose();
			this.gatt = null;
		}

		if (this.signaling) {
			this.signaling.dispose();
			this.signaling = null;
		}

		this.hci = null;
		this.handle = null;

		this._state = 'disconnected';
	}

	public async setupGatt(requestMtu?: number): Promise<HciGattRemote> {
		if (this.state !== 'connected' || !this.handle) {
			throw new Error(`Peripheral is not connected`);
		}

		if (!this.mtuExchanged) {
			await this.gatt.exchangeMtu(requestMtu || DEFAULT_MTU);
			this.mtuExchanged = true;
		}

		return this.gatt;
	}
}
