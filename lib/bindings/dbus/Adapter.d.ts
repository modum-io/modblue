import { BaseAdapter } from '../../Adapter';
import { BasePeripheral } from '../../Peripheral';
import { BusObject } from './BusObject';
import { Noble } from './Noble';
export declare class Adapter extends BaseAdapter<Noble> {
	private readonly object;
	private initialized;
	private scanning;
	private requestScanStop;
	private peripherals;
	private updateTimer;
	constructor(noble: Noble, id: string, name: string, address: string, object: BusObject);
	private init;
	private prop;
	private callMethod;
	getScannedPeripherals(): Promise<BasePeripheral[]>;
	isScanning(): Promise<boolean>;
	startScanning(): Promise<void>;
	private onScanStart;
	stopScanning(): Promise<void>;
	private onScanStop;
	private updatePeripherals;
	startAdvertising(): Promise<void>;
	stopAdvertising(): Promise<void>;
}
