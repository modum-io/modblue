import { Adapter, Peripheral } from '../../models';
import { BusObject } from './BusObject';
import { DbusNoble } from './Noble';
export declare class DbusAdapter extends Adapter<DbusNoble> {
    private readonly object;
    private initialized;
    private scanning;
    private requestScanStop;
    private peripherals;
    private updateTimer;
    constructor(noble: DbusNoble, id: string, name: string, address: string, object: BusObject);
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
}
