import { BaseAdapter } from '../../Adapter';
import { BasePeripheral } from '../../Peripheral';
import { AddressType } from '../../types';

import { BusObject, I_BLUEZ_ADAPTER, I_BLUEZ_DEVICE } from './BusObject';
import { Noble } from './Noble';
import { Peripheral } from './Peripheral';
import { buildTypedValue } from './TypeValue';

const UPDATE_INTERVAL = 1; // in seconds

export class Adapter extends BaseAdapter<Noble> {
	private readonly object: BusObject;

	private peripherals: Map<string, Peripheral> = new Map();
	private updateTimer: NodeJS.Timer;

	public constructor(noble: Noble, id: string, name: string, address: string, object: BusObject) {
		super(noble, id);

		this._name = name;
		this._address = address;
		this.object = object;
	}

	private prop<T>(propName: string) {
		return this.object.prop<T>(I_BLUEZ_ADAPTER, propName);
	}
	private callMethod<T>(methodName: string, ...args: any[]) {
		return this.object.callMethod<T>(I_BLUEZ_ADAPTER, methodName, ...args);
	}

	public async getScannedPeripherals(): Promise<BasePeripheral[]> {
		return [...this.peripherals.values()];
	}

	public async isScanning() {
		return this.prop<boolean>('Discovering');
	}

	public async startScanning() {
		if (!this.updateTimer) {
			this.updateTimer = setInterval(() => this.updatePeripherals(), UPDATE_INTERVAL * 1000);
		}

		if (await this.isScanning()) {
			return;
		}

		await this.callMethod('SetDiscoveryFilter', {
			Transport: buildTypedValue('string', 'le'),
			DuplicateData: buildTypedValue('boolean', false)
		});
		await this.callMethod('StartDiscovery');
	}

	public async stopScanning() {
		if (this.updateTimer) {
			clearInterval(this.updateTimer);
			this.updateTimer = null;
		}

		if (!(await this.isScanning())) {
			return;
		}

		await this.callMethod('StopDiscovery');
	}

	private async updatePeripherals() {
		const peripheralIds = await this.object.getChildrenNames();
		for (const peripheralId of peripheralIds) {
			let peripheral = this.peripherals.get(peripheralId);
			if (!peripheral) {
				const object = this.object.getChild(peripheralId);
				const address = await object.prop<string>(I_BLUEZ_DEVICE, 'Address');
				const addressType = await object.prop<AddressType>(I_BLUEZ_DEVICE, 'AddressType');
				peripheral = new Peripheral(this.noble, this, peripheralId, address, addressType, object);
				this.peripherals.set(peripheralId, peripheral);
			}
			// TODO: Devices are not removed from the list when they aren't detected anymore
			this.emit('discover', peripheral);
		}
	}
}
