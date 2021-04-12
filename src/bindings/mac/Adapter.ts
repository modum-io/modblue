import { Adapter, GattLocal, MODblue, Peripheral } from '../../models';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const NobleMac = require('../native/binding').NobleMac;

export class MacAdapter extends Adapter {
	private noble: any = null;
	private scanning = false;

	public async isScanning(): Promise<boolean> {
		return this.scanning;
	}

	public constructor(modblue: MODblue, id: string, name: string) {
		super(modblue, id, name);

		this.noble = new NobleMac();
	}

	public dispose(): void {
		this.noble.Stop();
	}

	public async startScanning(serviceUUIDs?: string[], allowDuplicates?: boolean): Promise<void> {
		this.noble.Scan(serviceUUIDs, allowDuplicates);
		this.scanning = true;
	}

	public async stopScanning(): Promise<void> {
		this.noble.StopScan();
		this.scanning = false;
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
