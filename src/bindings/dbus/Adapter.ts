import { Adapter, Peripheral } from '../../models';
import { AddressType } from '../../types';

import { buildTypedValue, BusObject, I_BLUEZ_ADAPTER, I_BLUEZ_DEVICE } from './misc';
import { DbusNoble } from './Noble';
import { DbusPeripheral } from './Peripheral';

const UPDATE_INTERVAL = 1; // in seconds

export class DbusAdapter extends Adapter {
	private readonly busObject: BusObject;
	private initialized: boolean = false;
	private scanning: boolean = false;
	private requestScanStop: boolean = false;

	private peripherals: Map<string, Peripheral> = new Map();
	private updateTimer: NodeJS.Timer;

	public constructor(noble: DbusNoble, id: string, name: string, address: string, busObject: BusObject) {
		super(noble, id);

		this._name = name;
		this._address = address;
		this.busObject = busObject;
	}

	private async init() {
		if (this.initialized) {
			return;
		}

		this.initialized = true;

		const propertiesIface = await this.busObject.getPropertiesInterface();
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
		propertiesIface.on('PropertiesChanged', onPropertiesChanged);
	}

	private prop<T>(propName: string) {
		return this.busObject.prop<T>(I_BLUEZ_ADAPTER, propName);
	}
	private callMethod<T>(methodName: string, ...args: any[]) {
		return this.busObject.callMethod<T>(I_BLUEZ_ADAPTER, methodName, ...args);
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

		this.updateTimer = setInterval(() => this.updatePeripherals(), UPDATE_INTERVAL * 1000);

		const scanning = await this.prop<boolean>('Discovering');
		if (scanning) {
			this.onScanStart();
			return;
		}

		await this.callMethod('SetDiscoveryFilter', {
			Transport: buildTypedValue('string', 'le'),
			DuplicateData: buildTypedValue('boolean', false)
		});
		await this.callMethod('StartDiscovery');
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
		await this.callMethod('StopDiscovery');
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

	private async updatePeripherals() {
		const peripheralIds = await this.busObject.getChildrenNames();
		for (const peripheralId of peripheralIds) {
			let peripheral = this.peripherals.get(peripheralId);
			if (!peripheral) {
				const busObject = this.busObject.getChild(peripheralId);
				const address = await busObject.prop<string>(I_BLUEZ_DEVICE, 'Address');
				const addressType = await busObject.prop<AddressType>(I_BLUEZ_DEVICE, 'AddressType');
				peripheral = new DbusPeripheral(this, peripheralId, address, addressType, busObject);
				this.peripherals.set(peripheralId, peripheral);
			}

			if (this.scanning) {
				// TODO: Devices are not removed from the list when they aren't detected anymore
				this.emit('discover', peripheral);
			}
		}
	}

	public async startAdvertising(): Promise<void> {
		throw new Error('Method not implemented.');
	}
	public async stopAdvertising(): Promise<void> {
		throw new Error('Method not implemented.');
	}
}
