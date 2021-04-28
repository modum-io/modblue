import { Adapter, GattLocal, MODblue, Peripheral } from '../../models';
export declare class MacAdapter extends Adapter {
    readonly noble: any;
    private initDone;
    private scanning;
    private peripherals;
    isScanning(): boolean;
    constructor(modblue: MODblue, id: string, name: string);
    private init;
    dispose(): void;
    startScanning(serviceUUIDs?: string[], allowDuplicates?: boolean): Promise<void>;
    private onDiscover;
    private onNotification;
    stopScanning(): Promise<void>;
    getScannedPeripherals(): Promise<Peripheral[]>;
    isAdvertising(): boolean;
    startAdvertising(): Promise<void>;
    stopAdvertising(): Promise<void>;
    setupGatt(): Promise<GattLocal>;
}
//# sourceMappingURL=Adapter.d.ts.map