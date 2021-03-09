import { ClientInterface } from 'dbus-next';

import { AddressType, GattRemote, Peripheral } from '../../models';

import { DbusAdapter } from './Adapter';
import { DbusGattRemote } from './gatt';
import { DbusObject, I_BLUEZ_DEVICE, I_PROPERTIES } from './misc';

const CONNECT_TIMEOUT = 10; // in seconds

export class DbusPeripheral extends Peripheral {
	public adapter: DbusAdapter;
	public readonly path: string;

	private deviceIface: ClientInterface;
	private propsIface: ClientInterface;
	private _init = false;

	private gatt: DbusGattRemote;

	private isConnecting = false;
	private connecting: [() => void, (error?: Error) => void][] = [];
	private connectTimeout: NodeJS.Timer;
	private isDisconnecting = false;
	private disconnecting: [() => void, (error?: Error) => void][] = [];
	private disconnectTimeout: NodeJS.Timer;

	public constructor(
		adapter: DbusAdapter,
		path: string,
		id: string,
		addressType: AddressType,
		address: string,
		advertisement: Record<string, unknown>,
		rssi: number
	) {
		super(adapter, id, addressType, address, advertisement, rssi);

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

	private async prop<T>(iface: string, name: string): Promise<T> {
		await this.init();
		const rawProp = await this.propsIface.Get(iface, name);
		return rawProp.value;
	}

	private async isConnected() {
		return this.prop<boolean>(I_BLUEZ_DEVICE, 'Connected');
	}

	public async connect(): Promise<void> {
		if (await this.isConnected()) {
			return;
		}

		if (this.isDisconnecting) {
			throw new Error(`Device is currently disconnecting, cannot connect`);
		}

		if (this.isConnecting) {
			return new Promise<void>((resolve, reject) => this.connecting.push([resolve, reject]));
		}

		this.connecting = [];
		this.isConnecting = true;

		await this.init();

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
		if (!(await this.isConnected())) {
			return;
		}

		if (this.isConnecting) {
			throw new Error(`Device is currently connecting, cannot disconnect`);
		}

		if (this.isDisconnecting) {
			return new Promise<void>((resolve, reject) => this.disconnecting.push([resolve, reject]));
		}

		this.disconnecting = [];
		this.isDisconnecting = true;

		await this.init();

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
		if (!this.isConnecting) {
			return;
		}

		this.isConnecting = false;
		clearTimeout(this.connectTimeout);

		if (error) {
			this.connecting.forEach(([, rej]) => rej(error));
		} else {
			this.connecting.forEach(([res]) => res());
		}

		this.connecting = [];
	}
	private doneDisconnecting(error?: Error) {
		if (!this.isDisconnecting) {
			return;
		}

		this.isDisconnecting = false;
		clearTimeout(this.disconnectTimeout);

		if (error) {
			this.disconnecting.forEach(([, rej]) => rej(error));
		} else {
			this.disconnecting.forEach(([res]) => res());
		}

		this.disconnecting = [];
	}

	public async setupGatt(requestMtu?: number): Promise<GattRemote> {
		if (this.gatt) {
			return this.gatt;
		}

		if (requestMtu) {
			throw new Error(`MTU requests are not accepted for dbus`);
		}

		this.gatt = new DbusGattRemote(this);
		return this.gatt;
	}
}
