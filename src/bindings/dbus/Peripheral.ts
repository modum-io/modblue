import { ClientInterface } from 'dbus-next';

import { Peripheral } from '../../models';
import { AddressType } from '../../types';

import { DbusAdapter } from './Adapter';
import { DbusGattRemote } from './gatt';
import { I_BLUEZ_DEVICE, I_PROPERTIES } from './misc';

// tslint:disable: promise-must-complete

const CONNECT_TIMEOUT = 10; // in seconds

export class DbusPeripheral extends Peripheral {
	public adapter: DbusAdapter;
	public readonly path: string;

	private deviceIface: ClientInterface;
	private propsIface: ClientInterface;
	private _init: boolean = false;

	private gatt: DbusGattRemote;

	private isConnecting: boolean = false;
	private connecting: [() => void, (error?: any) => void][] = [];
	private connectTimeout: NodeJS.Timer;
	private isDisconnecting: boolean = false;
	private disconnecting: [() => void, (error?: any) => void][] = [];
	private disconnectTimeout: NodeJS.Timer;

	public constructor(
		adapter: DbusAdapter,
		path: string,
		id: string,
		address: string,
		addressType: AddressType,
		advertisement: any,
		rssi: number
	) {
		super(adapter, id, address, addressType, advertisement, rssi);

		this.path = path;
	}

	private async init() {
		if (this._init) {
			return;
		}

		const obj = await this.adapter.noble.dbus.getProxyObject('org.bluez', this.path);
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

		return new Promise(async (resolve, reject) => {
			this.connecting.push([resolve, reject]);

			const done = () => this.doneConnecting();

			await this.init();

			const onPropertiesChanged = (iface: string, changedProps: any) => {
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
				this.doneConnecting('Connecting timed out');
				this.propsIface.off('PropertiesChanged', onPropertiesChanged);

				try {
					// Disconnect can be used to cancel pending connects
					await this.deviceIface.Disconnect();
				} catch {
					// NO-OP
				}
			};
			this.connectTimeout = setTimeout(timeout, CONNECT_TIMEOUT * 1000);

			try {
				await this.deviceIface.Connect();
			} catch (err) {
				this.doneConnecting(err);
			}
		});
	}

	public async disconnect(): Promise<number> {
		if (!(await this.isConnected())) {
			return;
		}

		if (this.isConnecting) {
			throw new Error(`Device is currently connecting, cannot disconnect`);
		}

		if (this.isDisconnecting) {
			return new Promise<number>((resolve, reject) => this.disconnecting.push([resolve, reject]));
		}

		this.disconnecting = [];
		this.isDisconnecting = true;

		return new Promise(async (resolve, reject) => {
			this.disconnecting.push([resolve, reject]);

			const done = () => this.doneDisconnecting();

			await this.init();

			const onPropertiesChanged = (iface: string, changedProps: any) => {
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
				this.doneDisconnecting('Disconnecting timed out');
				this.propsIface.off('PropertiesChanged', onPropertiesChanged);
			};
			this.disconnectTimeout = setTimeout(timeout, CONNECT_TIMEOUT * 1000);

			try {
				await this.deviceIface.Disconnect();
			} catch (err) {
				this.doneDisconnecting(err);
			}
		});
	}

	private doneConnecting(error?: any) {
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
	private doneDisconnecting(error?: any) {
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

	public async setupGatt(requestMtu?: number): Promise<DbusGattRemote> {
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
