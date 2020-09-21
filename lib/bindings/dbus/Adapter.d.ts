import { BaseAdapter } from '../../Adapter';
import { BusObject } from './BusObject';
import { Noble } from './Noble';
import { Peripheral } from './Peripheral';
export declare class Adapter extends BaseAdapter<Noble> {
    private readonly object;
    private peripherals;
    constructor(noble: Noble, id: string, name: string, address: string, object: BusObject);
    private prop;
    private callMethod;
    getScannedPeripherals(): Promise<Peripheral[]>;
    isScanning(): Promise<boolean>;
    startScanning(): Promise<void>;
    stopScanning(): Promise<void>;
    private updatePeripherals;
}
