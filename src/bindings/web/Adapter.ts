import { Adapter, GattLocal, Peripheral } from '../../models';

export class WebAdapter extends Adapter {
	private addDashes(uuid: string): string {
		return (
			`${uuid.substring(0, 8)}-` +
			`${uuid.substring(8, 12)}-` +
			`${uuid.substring(12, 16)}-` +
			`${uuid.substring(16, 20)}-` +
			`${uuid.substring(20)}`
		).toLowerCase();
	}

	public isScanning(): Promise<boolean> {
		throw new Error('Method not implemented.');
	}
	public async startScanning(serviceUUIDs?: string[]): Promise<void> {
		const opts: RequestDeviceOptions = { filters: [] };

		if (serviceUUIDs) {
			// web bluetooth requires 4 char hex service names to be passed in as integers
			const mappedServiceUUIDs = serviceUUIDs.map((service) => {
				if (service.length === 4) {
					return parseInt(`0x${service}`);
				} else if (service.length === 6 && service.indexOf('0x') === 0) {
					return parseInt(service);
				}
				return this.addDashes(service);
			});
			opts.filters = mappedServiceUUIDs.map((srv) => ({ services: [srv] }));
		}

		navigator.bluetooth.requestDevice(opts).then((dev) => console.log(dev));
	}

	public stopScanning(): Promise<void> {
		throw new Error('Method not implemented.');
	}

	public getScannedPeripherals(): Promise<Peripheral[]> {
		throw new Error('Method not implemented.');
	}

	public isAdvertising(): Promise<boolean> {
		throw new Error('Method not implemented.');
	}

	public startAdvertising(deviceName: string, serviceUUIDs?: string[]): Promise<void> {
		throw new Error('Method not implemented.');
	}

	public stopAdvertising(): Promise<void> {
		throw new Error('Method not implemented.');
	}

	public setupGatt(maxMtu?: number): Promise<GattLocal> {
		throw new Error('Method not implemented.');
	}
}
