import { Adapter, GattLocal, Peripheral } from '../../models';
export declare class WebAdapter extends Adapter {
    private peripherals;
    dispose(): void;
    isScanning(): Promise<boolean>;
    startScanning(): Promise<void>;
    scanFor(filter: string | ((peripheral: Peripheral) => boolean), timeoutInSeconds?: number, serviceUUIDs?: string[]): Promise<Peripheral>;
    stopScanning(): Promise<void>;
    getScannedPeripherals(): Promise<Peripheral[]>;
    isAdvertising(): Promise<boolean>;
    startAdvertising(): Promise<void>;
    stopAdvertising(): Promise<void>;
    setupGatt(): Promise<GattLocal>;
    private addDashes;
}
//# sourceMappingURL=Adapter.d.ts.map