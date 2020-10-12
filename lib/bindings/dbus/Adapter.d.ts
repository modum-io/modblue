import { Adapter, Peripheral } from '../../models';
import { BusObject } from './misc';
import { DbusNoble } from './Noble';
export declare class DbusAdapter extends Adapter {
    private readonly busObject;
    private initialized;
    private scanning;
    private requestScanStop;
    private peripherals;
    private updateTimer;
    constructor(noble: DbusNoble, id: string, name: string, address: string, busObject: BusObject);
    private init;
    private prop;
    private callMethod;
    getScannedPeripherals(): Promise<Peripheral[]>;
    isScanning(): Promise<boolean>;
    startScanning(): Promise<void>;
    private onScanStart;
    stopScanning(): Promise<void>;
    private onScanStop;
    private updatePeripherals;
    startAdvertising(): Promise<void>;
    stopAdvertising(): Promise<void>;
}
