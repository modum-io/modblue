import { ClientInterface } from 'dbus-next';

import { AddressType, Peripheral } from '../../models';

import { DbusAdapter } from './Adapter';
import { DbusGatt } from './gatt';
import { DbusObject, I_BLUEZ_DEVICE, I_PROPERTIES } from './misc';

const CONNECT_TIMEOUT = 10; // in seconds

export class DbusPeripheral extends Peripheral {
	public adapter: DbusAdapter;
	public readonly path: string;

	private deviceIface: ClientInterface;
	private propsIface: ClientInterface;
	private _init = false;

	protected _gatt: DbusGatt;

	private connecting: [(gatt: DbusGatt) => void, (error?: Error) => void][] = [];
	private connectTimeout: NodeJS.Timer;

	private disconnecting: [() => void, (error?: Error) => void][] = [];
	private disconnectTimeout: NodeJS.Timer;

	public constructor(
		adapter: DbusAdapter,
		path: string,
		id: string,
		name: string,
		addressType: AddressType,
		address: string,
		advertisement: Record<string, unknown>,
		rssi: number
	) {
		super(adapter, id, name, addressType, address, advertisement, rssi);

		this.path = path;
	}

	private async init() {
		if (this._init) {
			return;
		}

		const obj = await this.adapter.modblue.dbus.getProxyObject('org.bluez', this.path);
		this.propsIface = obj.getInterface(I_PROPERTIES);
		this.deviceIface = obj.getInterface(I_BLUEZ_DEVICE);

		this._init = true;
	}

	public async connect(): Promise<DbusGatt> {
		if (this._state === 'connected') {
			return;
		}
		if (this._state === 'disconnecting') {
			throw new Error(`Device is currently disconnecting, cannot connect`);
		}
		if (this._state === 'connecting') {
			return new Promise<DbusGatt>((resolve, reject) => this.connecting.push([resolve, reject]));
		}

		this.connecting = [];
		this._state = 'connecting';

		await this.init();

		const connected = (await this.propsIface.Get(I_BLUEZ_DEVICE, 'Connected')).value;
		if (connected) {
			this._state = 'connected';
			return;
		}

		return new Promise((resolve, reject) => {
			this.connecting.push([resolve, reject]);

			const done = () => this.doneConnecting();

			const onPropertiesChanged = (iface: string, changedProps: DbusObject) => {
				if (iface !== I_BLUEZ_DEVICE) {
					return;
				}

				if ('Connected' in changedProps && changedProps.Connected.value) {
					this.propsIface.off('PropertiesChanged', onPropertiesChanged);
					done();
				}
			};
			this.propsIface.on('PropertiesChanged', onPropertiesChanged);

			const timeout = async () => {
				this.doneConnecting(new Error('Connecting timed out'));
				this.propsIface.off('PropertiesChanged', onPropertiesChanged);

				try {
					// Disconnect can be used to cancel pending connects
					await this.deviceIface.Disconnect();
				} catch {
					// NO-OP
				}
			};
			this.connectTimeout = setTimeout(timeout, CONNECT_TIMEOUT * 1000);

			this.deviceIface.Connect().catch((err: Error) => this.doneConnecting(err));
		});
	}

	public async disconnect(): Promise<void> {
		if (this.state === 'disconnecting') {
			return new Promise<void>((resolve, reject) => this.disconnecting.push([resolve, reject]));
		}

		this.disconnecting = [];
		this._state = 'disconnecting';

		await this.init();

		const connected = (await this.propsIface.Get(I_BLUEZ_DEVICE, 'Connected')).value;
		if (!connected) {
			this._state = 'disconnected';
			return;
		}

		return new Promise<void>((resolve, reject) => {
			this.disconnecting.push([resolve, reject]);

			const done = () => this.doneDisconnecting();

			const onPropertiesChanged = (iface: string, changedProps: DbusObject) => {
				if (iface !== I_BLUEZ_DEVICE) {
					return;
				}

				if ('Connected' in changedProps && !changedProps.Connected.value) {
					this.propsIface.off('PropertiesChanged', onPropertiesChanged);
					done();
				}
			};
			this.propsIface.on('PropertiesChanged', onPropertiesChanged);

			const timeout = () => {
				this.doneDisconnecting(new Error('Disconnecting timed out'));
				this.propsIface.off('PropertiesChanged', onPropertiesChanged);
			};
			this.disconnectTimeout = setTimeout(timeout, CONNECT_TIMEOUT * 1000);

			this.deviceIface.Disconnect().catch((err: Error) => this.doneDisconnecting(err));
		});
	}

	private doneConnecting(error?: Error) {
		if (this._state !== 'connecting') {
			return;
		}

		this._state = 'connected';
		clearTimeout(this.connectTimeout);

		if (error) {
			this.connecting.forEach(([, rej]) => rej(error));
		} else {
			this._gatt = new DbusGatt(this);
			this.connecting.forEach(([res]) => res(this._gatt));
		}

		this.connecting = [];
	}
	private doneDisconnecting(error?: Error) {
		if (this._state !== 'disconnecting') {
			return;
		}

		this._state = 'disconnected';
		clearTimeout(this.disconnectTimeout);

		if (error) {
			this.disconnecting.forEach(([, rej]) => rej(error));
		} else {
			this.disconnecting.forEach(([res]) => res());
		}

		this.disconnecting = [];
	}
}
