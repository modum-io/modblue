import { BaseAdapter } from '../../Adapter';
import { BasePeripheral } from '../../Peripheral';
import { BusObject } from './BusObject';
import { Noble } from './Noble';
export declare class Adapter extends BaseAdapter<Noble> {
    private readonly object;
    private peripherals;
    private updateTimer;
    constructor(noble: Noble, id: string, name: string, address: string, object: BusObject);
    private prop;
    private callMethod;
    getScannedPeripherals(): Promise<BasePeripheral[]>;
    isScanning(): Promise<boolean>;
    startScanning(): Promise<void>;
    stopScanning(): Promise<void>;
    private updatePeripherals;
}
