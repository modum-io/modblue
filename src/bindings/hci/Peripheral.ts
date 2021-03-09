import { GattRemote, Peripheral } from '../../models';

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

	private _isMaster: boolean;
	public get isMaster(): boolean {
		return this._isMaster;
	}

	public async connect(
		minInterval?: number,
		maxInterval?: number,
		latency?: number,
		supervisionTimeout?: number
	): Promise<void> {
		if (this._state === 'connected') {
			return;
		}

		this._state = 'connecting';
		await this.adapter.connect(this, minInterval, maxInterval, latency, supervisionTimeout);
	}
	public onConnect(isMaster: boolean, hci: Hci, handle: number): void {
		this.hci = hci;
		this.handle = handle;
		this._isMaster = isMaster;

		this.signaling = new Signaling(this.hci, this.handle);
		this.gatt = new HciGattRemote(this, hci, handle);

		this.mtuExchanged = false;

		this._state = 'connected';
	}

	public async disconnect(): Promise<void> {
		if (this._state === 'disconnected') {
			return;
		}

		this._state = 'disconnecting';
		await this.adapter.disconnect(this);
	}
	public onDisconnect(reason?: string): void {
		if (this.gatt) {
			this.gatt.dispose(reason);
			this.gatt = null;
		}

		if (this.signaling) {
			this.signaling.dispose();
			this.signaling = null;
		}

		this.hci = null;
		this.handle = null;

		this.mtuExchanged = false;
		this._state = 'disconnected';
	}

	public async setupGatt(requestMtu: number = DEFAULT_MTU): Promise<GattRemote> {
		if (this.state !== 'connected' || !this.handle) {
			throw new Error(`Peripheral is not connected`);
		}

		if (!this.mtuExchanged) {
			await this.gatt.exchangeMtu(requestMtu);
			this.mtuExchanged = true;
		}

		return this.gatt;
	}
}
