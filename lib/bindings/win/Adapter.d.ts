import { Adapter, GattLocal, MODblue, Peripheral } from '../../models';
import { NobleBindings, Radio } from './bindings';
export declare class WinAdapter extends Adapter {
    readonly noble: NobleBindings;
    private initDone;
    private scanning;
    private peripherals;
    isScanning(): boolean;
    constructor(modblue: MODblue, radio: Radio);
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