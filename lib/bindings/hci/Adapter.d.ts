import { BaseAdapter } from '../../Adapter';
import { BasePeripheral } from '../../Peripheral';
import { Noble } from './Noble';
import { Peripheral } from './Peripheral';
export declare class Adapter extends BaseAdapter<Noble> {
	private initialized;
	private scanning;
	private hci;
	private gap;
	private peripherals;
	private uuidToHandle;
	private handleToUUID;
	getScannedPeripherals(): Promise<BasePeripheral[]>;
	isScanning(): Promise<boolean>;
	private init;
	dispose(): void;
	startScanning(): Promise<void>;
	stopScanning(): Promise<void>;
	private onDiscover;
	connect(peripheral: Peripheral): Promise<void>;
	disconnect(peripheral: Peripheral): Promise<void>;
}
