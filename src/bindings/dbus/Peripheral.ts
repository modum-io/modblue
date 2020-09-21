import { BasePeripheral } from '../../Peripheral';
import { BaseService } from '../../Service';
import { AddressType } from '../../types';

import { Adapter } from './Adapter';
import { BusObject, I_BLUEZ_DEVICE, I_BLUEZ_SERVICE } from './BusObject';
import { Noble } from './Noble';
import { Service } from './Service';

// tslint:disable: promise-must-complete

const CONNECT_TIMEOUT = 10; // in seconds

export class Peripheral extends BasePeripheral<Noble, Adapter> {
	private readonly object: BusObject;

	private services: Map<string, Service> = new Map();

	private isConnecting: boolean = false;
	private connecting: [() => void, (error?: any) => void][] = [];
	private connectTimeout: NodeJS.Timer;
	private isDisconnecting: boolean = false;
	private disconnecting: [() => void, (error?: any) => void][] = [];
	private disconnectTimeout: NodeJS.Timer;

	public constructor(
		noble: Noble,
		adapter: Adapter,
		id: string,
		address: string,
		addressType: AddressType,
		object: BusObject
	) {
		super(noble, adapter, id, address, addressType);

		this.object = object;
	}

	private prop<T>(propName: string) {
		return this.object.prop<T>(I_BLUEZ_DEVICE, propName);
	}
	private callMethod<T>(methodName: string, ...args: any[]) {
		return this.object.callMethod<T>(I_BLUEZ_DEVICE, methodName, ...args);
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

			const propertiesIface = await this.object.getPropertiesInterface();
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

			const propertiesIface = await this.object.getPropertiesInterface();
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

	public getDiscoveredServices(): BaseService[] {
		return [...this.services.values()];
	}

	public discoverServices(serviceUUIDs?: string[]): Promise<BaseService[]> {
		return new Promise<Service[]>(async (resolve, reject) => {
			let cancelled = false;
			const onTimeout = () => {
				cancelled = true;
				reject(new Error('Discovering timed out'));
			};
			const timeout = setTimeout(onTimeout, CONNECT_TIMEOUT * 1000);

			const servicesResolved = await this.prop<boolean>('ServicesResolved');
			if (!servicesResolved) {
				await new Promise(async (res) => {
					const propertiesIface = await this.object.getPropertiesInterface();
					const onPropertiesChanged = (iface: string, changedProps: any) => {
						if (iface !== I_BLUEZ_DEVICE) {
							return;
						}

						if ('ServicesResolved' in changedProps && changedProps.ServicesResolved.value) {
							propertiesIface.off('PropertiesChanged', onPropertiesChanged);
							res();
						}
					};
					propertiesIface.on('PropertiesChanged', onPropertiesChanged);
				});
			}

			if (cancelled) {
				// If we canceled by timeout then all the promises have already been rejected, so just return.
				return;
			} else {
				clearTimeout(timeout);
			}

			const serviceIds = await this.object.getChildrenNames();
			for (const serviceId of serviceIds) {
				let service = this.services.get(serviceId);
				if (!service) {
					const object = this.object.getChild(serviceId);
					const uuid = (await object.prop<string>(I_BLUEZ_SERVICE, 'UUID')).replace(/\-/g, '');
					service = new Service(this.noble, this, uuid, object);
					this.services.set(uuid, service);
				}
			}

			resolve([...this.services.values()]);
		});
	}
}
