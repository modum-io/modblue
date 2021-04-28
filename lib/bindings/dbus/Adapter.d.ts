import { Adapter, GattLocal, Peripheral } from '../../models';
import { DbusMODblue } from './MODblue';
export declare class DbusAdapter extends Adapter {
    modblue: DbusMODblue;
    readonly path: string;
    private objManagerIface;
    private adapterIface;
    private propsIface;
    private initialized;
    private scanning;
    private requestScanStop;
    private updateTimer;
    private scanChangeListeners;
    private peripherals;
    constructor(modblue: DbusMODblue, path: string, name: string, address: string);
    private init;
    private prop;
    getScannedPeripherals(): Promise<Peripheral[]>;
    isScanning(): boolean;
    startScanning(): Promise<void>;
    private onScanStart;
    stopScanning(): Promise<void>;
    private onScanStop;
    private onDeviceFound;
    private updatePeripherals;
    isAdvertising(): boolean;
    startAdvertising(): Promise<void>;
    stopAdvertising(): Promise<void>;
    setupGatt(): Promise<GattLocal>;
}
//# sourceMappingURL=Adapter.d.ts.map