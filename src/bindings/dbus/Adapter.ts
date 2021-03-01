import { ClientInterface } from 'dbus-next';

import { Adapter, AddressType, GattLocal, Peripheral } from '../../models';

import { buildTypedValue, I_BLUEZ_ADAPTER, I_BLUEZ_DEVICE, I_OBJECT_MANAGER, I_PROPERTIES } from './misc';
import { DbusMODblue } from './MODblue';
import { DbusPeripheral } from './Peripheral';

const UPDATE_INTERVAL = 5; // in seconds

export class DbusAdapter extends Adapter {
	public modblue: DbusMODblue;
	public readonly path: string;

	private objManagerIface: ClientInterface;
	private adapterIface: ClientInterface;
	private propsIface: ClientInterface;

	private initialized: boolean = false;
	private scanning: boolean = false;
	private requestScanStop: boolean = false;
	private updateTimer: NodeJS.Timer;

	private peripherals: Map<string, Peripheral> = new Map();

	public constructor(modblue: DbusMODblue, path: string, name: string, address: string) {
		super(modblue, path.replace(`/org/bluez/`, ''));

		this.path = path;
		this._name = name;
		this._address = address;
	}

	private async init() {
		if (this.initialized) {
			return;
		}

		this.initialized = true;

		const objManager = await this.modblue.dbus.getProxyObject(`org.bluez`, '/');
		this.objManagerIface = objManager.getInterface(I_OBJECT_MANAGER);
		this.objManagerIface.on('InterfacesAdded', (path: string, data: any) => {
			if (!path.startsWith(`${this.path}/`)) {
				return;
			}

			const deviceObj = data[I_BLUEZ_DEVICE];
			if (!deviceObj) {
				return;
			}

			if (this.scanning) {
				this.onDeviceFound(path, deviceObj);
			}
		});

		const obj = await this.modblue.dbus.getProxyObject(`org.bluez`, this.path);
		this.adapterIface = obj.getInterface(I_BLUEZ_ADAPTER);
		this.propsIface = obj.getInterface(I_PROPERTIES);

		const onPropertiesChanged = (iface: string, changedProps: any) => {
			if (iface !== I_BLUEZ_ADAPTER) {
				return;
			}

			if ('Discovering' in changedProps) {
				if (this.scanning && !changedProps.Discovering.value) {
					this.onScanStop();
				} else if (!this.scanning && changedProps.Discovering.value) {
					this.onScanStart();
				}
			}
		};
		this.propsIface.on('PropertiesChanged', onPropertiesChanged);
	}

	private async prop<T>(iface: string, name: string): Promise<T> {
		const rawProp = await this.propsIface.Get(iface, name);
		return rawProp.value;
	}

	public async getScannedPeripherals(): Promise<Peripheral[]> {
		return [...this.peripherals.values()];
	}

	public async isScanning() {
		return this.scanning;
	}

	public async startScanning() {
		await this.init();

		if (this.scanning) {
			return;
		}

		const scanning = await this.prop<boolean>(I_BLUEZ_ADAPTER, 'Discovering');
		if (!scanning) {
			await this.adapterIface.SetDiscoveryFilter({
				Transport: buildTypedValue('string', 'le'),
				DuplicateData: buildTypedValue('boolean', false)
			});
			await this.adapterIface.StartDiscovery();
		}

		const objs = await this.objManagerIface.GetManagedObjects();
		const keys = Object.keys(objs);
		for (const key of keys) {
			this.objManagerIface.emit('InterfacesAdded', key, objs[key]);
		}

		this.updateTimer = setInterval(this.updatePeripherals, UPDATE_INTERVAL * 1000);
	}

	private onScanStart() {
		this.scanning = true;
	}

	public async stopScanning() {
		if (!this.scanning) {
			return;
		}

		clearInterval(this.updateTimer);
		this.updateTimer = null;

		this.requestScanStop = true;
		await this.adapterIface.StopDiscovery();
	}

	private onScanStop() {
		this.scanning = false;

		if (this.requestScanStop) {
			this.requestScanStop = false;
			return;
		}

		// Some adapters stop scanning when connecting. We want to automatically start scanning again.
		this.startScanning().catch(() => {
			// NO-OP
		});
	}

	private onDeviceFound = (path: string, data: any) => {
		const id = path.replace(`${this.path}/`, '');

		let peripheral = this.peripherals.get(id);
		if (!peripheral) {
			const address = data.Address?.value as string;
			const addressType = data.AddressType?.value as AddressType;
			const advertisement = data.ManufacturerData?.value;
			const rssi = data.RSSI?.value as number;
			peripheral = new DbusPeripheral(this, path, id, addressType, address, advertisement, rssi);
			this.peripherals.set(id, peripheral);
		}

		this.emit('discover', peripheral);
	};

	private updatePeripherals = async () => {
		const objs = await this.objManagerIface.GetManagedObjects();
		const keys = Object.keys(objs);

		for (const devicePath of keys) {
			if (!devicePath.startsWith(this.path)) {
				continue;
			}

			const deviceObj = objs[devicePath][I_BLUEZ_DEVICE];
			if (!deviceObj) {
				continue;
			}

			this.onDeviceFound(devicePath, deviceObj);
		}
	};

	public async isAdvertising() {
		return false;
	}

	public async startAdvertising(): Promise<void> {
		throw new Error('Method not implemented.');
	}
	public async stopAdvertising(): Promise<void> {
		throw new Error('Method not implemented.');
	}

	public setupGatt(maxMtu?: number): Promise<GattLocal> {
		throw new Error('Method not implemented.');
	}
}
