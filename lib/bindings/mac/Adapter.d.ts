import { Adapter, GattLocal, MODblue, Peripheral } from '../../models';
export declare class MacAdapter extends Adapter {
    readonly noble: any;
    private initDone;
    private scanning;
    private peripherals;
    isScanning(): Promise<boolean>;
    constructor(modblue: MODblue, id: string, name: string);
    private init;
    dispose(): void;
    startScanning(serviceUUIDs?: string[], allowDuplicates?: boolean): Promise<void>;
    private onDiscover;
    stopScanning(): Promise<void>;
    getScannedPeripherals(): Promise<Peripheral[]>;
    isAdvertising(): Promise<boolean>;
    startAdvertising(deviceName: string, serviceUUIDs?: string[]): Promise<void>;
    stopAdvertising(): Promise<void>;
    setupGatt(maxMtu?: number): Promise<GattLocal>;
}
//# sourceMappingURL=Adapter.d.ts.map