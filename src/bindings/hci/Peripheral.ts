import { ConnectOptions, Peripheral } from '../../models';

import { HciAdapter } from './Adapter';
import { HciGattRemote } from './gatt';
import { Hci, Signaling } from './misc';

// 512 bytes is max char size + 1 byte att opcode + 2 bytes handle + 2 bytes offset for long writes
const DEFAULT_MTU = 517;

export class HciPeripheral extends Peripheral {
	public adapter: HciAdapter;

	protected _gatt: HciGattRemote;
	private hci: Hci;
	private handle: number;
	private signaling: Signaling;

	private _isMaster: boolean;
	public get isMaster(): boolean {
		return this._isMaster;
	}

	public async connect(options?: ConnectOptions): Promise<HciGattRemote> {
		if (this._state === 'connected') {
			return;
		}

		this._state = 'connecting';
		await this.adapter.connect(
			this,
			options?.minInterval,
			options?.maxInterval,
			options?.latency,
			options?.supervisionTimeout
		);

		await this._gatt.exchangeMtu(options?.mtu || DEFAULT_MTU);

		return this._gatt;
	}
	public onConnect(isMaster: boolean, hci: Hci, handle: number): void {
		this.hci = hci;
		this.handle = handle;
		this._isMaster = isMaster;

		this.signaling = new Signaling(this.hci, this.handle);
		this._gatt = new HciGattRemote(this, hci, handle);

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
		if (this._gatt) {
			this._gatt.dispose(reason);
			this._gatt = null;
		}

		if (this.signaling) {
			this.signaling.dispose();
			this.signaling = null;
		}

		this.hci = null;
		this.handle = null;

		this._state = 'disconnected';
	}
}
