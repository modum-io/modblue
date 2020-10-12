import { Peripheral } from '../../models';
import { AddressType } from '../../types';

import { DbusAdapter } from './Adapter';
import { DbusGattRemote, DbusGattServiceRemote } from './gatt';
import { BusObject, I_BLUEZ_DEVICE } from './misc';

// tslint:disable: promise-must-complete

const CONNECT_TIMEOUT = 10; // in seconds

export class DbusPeripheral extends Peripheral {
	private readonly busObject: BusObject;
	private gatt: DbusGattRemote;

	public services: Map<string, DbusGattServiceRemote> = new Map();

	private isConnecting: boolean = false;
	private connecting: [() => void, (error?: any) => void][] = [];
	private connectTimeout: NodeJS.Timer;
	private isDisconnecting: boolean = false;
	private disconnecting: [() => void, (error?: any) => void][] = [];
	private disconnectTimeout: NodeJS.Timer;

	public constructor(
		adapter: DbusAdapter,
		id: string,
		address: string,
		addressType: AddressType,
		busObject: BusObject
	) {
		super(adapter, id, address, addressType);

		this.busObject = busObject;
	}

	private prop<T>(propName: string) {
		return this.busObject.prop<T>(I_BLUEZ_DEVICE, propName);
	}
	private callMethod<T>(methodName: string, ...args: any[]) {
		return this.busObject.callMethod<T>(I_BLUEZ_DEVICE, methodName, ...args);
	}

	private async isConnected() {
		return this.prop<boolean>('Connected');
	}

	public async connect(requestMtu?: number): Promise<void> {
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

			const propertiesIface = await this.busObject.getPropertiesInterface();
			const onPropertiesChanged = (iface: string, changedProps: any) => {
				if (iface !== I_BLUEZ_DEVICE) {
					return;
				}

				if ('Connected' in changedProps && changedProps.Connected.value) {
					propertiesIface.off('PropertiesChanged', onPropertiesChanged);
					done();
				}
			};
			propertiesIface.on('PropertiesChanged', onPropertiesChanged);

			const timeout = async () => {
				this.doneConnecting('Connecting timed out');
				propertiesIface.off('PropertiesChanged', onPropertiesChanged);

				try {
					// Disconnect can be used to cancel pending connects
					await this.callMethod('Disconnect');
				} catch {
					// NO-OP
				}
			};
			this.connectTimeout = setTimeout(timeout, CONNECT_TIMEOUT * 1000);

			try {
				await this.callMethod('Connect');
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

		// Currently disabled the cache after disconnect because it seems to throw errors
		// this.gattServer = null;

		this.disconnecting = [];
		this.isDisconnecting = true;

		return new Promise(async (resolve, reject) => {
			this.disconnecting.push([resolve, reject]);

			const done = () => this.doneDisconnecting();

			const propertiesIface = await this.busObject.getPropertiesInterface();
			const onPropertiesChanged = (iface: string, changedProps: any) => {
				if (iface !== I_BLUEZ_DEVICE) {
					return;
				}

				if ('Connected' in changedProps && !changedProps.Connected.value) {
					propertiesIface.off('PropertiesChanged', onPropertiesChanged);
					done();
				}
			};
			propertiesIface.on('PropertiesChanged', onPropertiesChanged);

			const timeout = () => {
				this.doneDisconnecting('Disconnecting timed out');
				propertiesIface.off('PropertiesChanged', onPropertiesChanged);
			};
			this.disconnectTimeout = setTimeout(timeout, CONNECT_TIMEOUT * 1000);

			try {
				await this.callMethod('Disconnect');
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

		this.gatt = new DbusGattRemote(this, this.busObject);
		return this.gatt;
	}
}
