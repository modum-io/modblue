import { Adapter, Gatt, MODblue, Peripheral } from '../../models';

import { WebPeripheral } from './Peripheral';

export class WebAdapter extends Adapter {
	private scan: BluetoothLEScan;

	private peripherals: Map<string, WebPeripheral> = new Map();

	public constructor(modblue: MODblue, id: string, name?: string, address?: string) {
		super(modblue, id, name, address);

		navigator.bluetooth.addEventListener('advertisementreceived', this.onAdvertisement);
	}

	public dispose(): void {
		navigator.bluetooth.removeEventListener('advertisementreceived', this.onAdvertisement);
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

	public isScanning(): Promise<boolean> {
		throw new Error('Method not implemented.');
	}
	public async startScanning(serviceUUIDs?: string[]): Promise<void> {
		let opts: RequestLEScanOptions;

		if (serviceUUIDs) {
			// web bluetooth requires 4 char hex service names to be passed in as integers
			const mappedServiceUUIDs = serviceUUIDs.map((service) => {
				if (service.length === 4) {
					return { services: [parseInt(`0x${service}`)] };
				} else if (service.length === 6 && service.indexOf('0x') === 0) {
					return { services: [parseInt(service)] };
				}
				return { services: [this.addDashes(service)] };
			});
			opts = { filters: mappedServiceUUIDs };
		} else {
			opts = { acceptAllAdvertisements: true };
		}

		this.scan = await navigator.bluetooth.requestLEScan(opts);
	}

	private onAdvertisement = ({ device, rssi, manufacturerData }: BluetoothAdvertisementEvent) => {
		const uuid = device.id;

		const adv: Record<string, unknown> = {};
		for (const [key, value] of manufacturerData) {
			adv[key] = value;
		}

		let peripheral = this.peripherals.get(uuid);
		if (!peripheral) {
			peripheral = new WebPeripheral(this, uuid, adv, rssi);
			this.peripherals.set(uuid, peripheral);
		} else {
			peripheral.advertisement = adv;
			peripheral.rssi = rssi;
		}

		this.emit('discover', peripheral);
	};

	public async stopScanning(): Promise<void> {
		if (this.scan) {
			this.scan.stop();
			this.scan = null;
		}
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

	public setupGatt(maxMtu?: number): Promise<Gatt> {
		throw new Error('Method not implemented.');
	}
}
