import { Adapter, GattLocal, Peripheral } from '../../models';
import { DbusNoble } from './Noble';
export declare class DbusAdapter extends Adapter {
    noble: DbusNoble;
    readonly path: string;
    private objManagerIface;
    private adapterIface;
    private propsIface;
    private initialized;
    private scanning;
    private requestScanStop;
    private updateTimer;
    private peripherals;
    constructor(noble: DbusNoble, path: string, name: string, address: string);
    private init;
    private prop;
    getScannedPeripherals(): Promise<Peripheral[]>;
    isScanning(): Promise<boolean>;
    startScanning(): Promise<void>;
    private onScanStart;
    stopScanning(): Promise<void>;
    private onScanStop;
    private onDeviceFound;
    private updatePeripherals;
    startAdvertising(): Promise<void>;
    stopAdvertising(): Promise<void>;
    setupGatt(maxMtu?: number): Promise<GattLocal>;
}
