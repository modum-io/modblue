import { Adapter, GattLocal, Peripheral } from '../../models';

import { WebPeripheral } from './Peripheral';

export class WebAdapter extends Adapter {
	private peripherals: Map<string, WebPeripheral> = new Map();

	public dispose(): void {
		// NO-OP
	}

	public isScanning(): Promise<boolean> {
		throw new Error('Method not implemented.');
	}

	public async startScanning(): Promise<void> {
		throw new Error('Method not implemented.');
	}

	public async scanFor(
		filter: string | ((peripheral: Peripheral) => boolean),
		timeoutInSeconds = 10,
		serviceUUIDs?: string[]
	): Promise<Peripheral> {
		// web bluetooth requires 4 char hex service names to be passed in as integers
		const mappedServiceUUIDs = (serviceUUIDs || []).map((service) => {
			if (service.length === 4) {
				return parseInt(`0x${service}`);
			} else if (service.length === 6 && service.indexOf('0x') === 0) {
				return parseInt(service);
			}
			return this.addDashes(service);
		});

		let opts: RequestDeviceOptions;
		if (typeof filter === 'function') {
			opts = { acceptAllDevices: true, optionalServices: mappedServiceUUIDs };
		} else {
			opts = { filters: [{ namePrefix: filter }], optionalServices: mappedServiceUUIDs };
		}

		const start = new Date().getTime();
		do {
			const device = await navigator.bluetooth.requestDevice(opts);
			if (!device) {
				throw new Error(`No device found`);
			}

			let peripheral = this.peripherals.get(device.id);
			if (!peripheral) {
				peripheral = new WebPeripheral(this, device);
				this.peripherals.set(device.id, peripheral);
			}

			if (typeof filter === 'function' && !filter(peripheral)) {
				throw new Error(`Device not found`);
			}
			return peripheral;
		} while (start + timeoutInSeconds * 1000 >= new Date().getTime());
	}

	public async stopScanning(): Promise<void> {
		throw new Error('Method not implemented.');
	}

	public async getScannedPeripherals(): Promise<Peripheral[]> {
		throw new Error('Method not implemented.');
	}

	public async isAdvertising(): Promise<boolean> {
		throw new Error('Method not implemented.');
	}

	public async startAdvertising(): Promise<void> {
		throw new Error('Method not implemented.');
	}

	public async stopAdvertising(): Promise<void> {
		throw new Error('Method not implemented.');
	}

	public async setupGatt(): Promise<GattLocal> {
		throw new Error('Method not implemented.');
	}

	private addDashes(uuid: string): string {
		return (
			`${uuid.substring(0, 8)}-` +
			`${uuid.substring(8, 12)}-` +
			`${uuid.substring(12, 16)}-` +
			`${uuid.substring(16, 20)}-` +
			`${uuid.substring(20)}`
		).toLowerCase();
	}
}
