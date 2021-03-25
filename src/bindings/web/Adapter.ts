import { Adapter, Gatt, Peripheral } from '../../models';

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
		isTarget: (peripheral: Peripheral) => boolean,
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

		const opts: RequestDeviceOptions = { acceptAllDevices: true, optionalServices: mappedServiceUUIDs };

		const start = new Date().getTime();
		do {
			const device = await navigator.bluetooth.requestDevice(opts);
			if (!device) {
				throw new Error(`No device found`);
			}

			const uuid = device.id;

			let peripheral = this.peripherals.get(uuid);
			if (!peripheral) {
				peripheral = new WebPeripheral(this, uuid, device);
				this.peripherals.set(uuid, peripheral);
			}

			if (!isTarget(peripheral)) {
				throw new Error(`Device not found`);
			}
			return peripheral;
		} while (start + timeoutInSeconds * 1000 >= new Date().getTime());
	}

	public async stopScanning(): Promise<void> {
		throw new Error('Method not implemented.');
	}

	public getScannedPeripherals(): Promise<Peripheral[]> {
		throw new Error('Method not implemented.');
	}

	public isAdvertising(): Promise<boolean> {
		throw new Error('Method not implemented.');
	}

	public startAdvertising(): Promise<void> {
		throw new Error('Method not implemented.');
	}

	public stopAdvertising(): Promise<void> {
		throw new Error('Method not implemented.');
	}

	public setupGatt(): Promise<Gatt> {
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
