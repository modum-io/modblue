import { Adapter, Gatt, Peripheral } from '../../models';
export declare class WebAdapter extends Adapter {
    private addDashes;
    isScanning(): Promise<boolean>;
    startScanning(serviceUUIDs?: string[]): Promise<void>;
    stopScanning(): Promise<void>;
    getScannedPeripherals(): Promise<Peripheral[]>;
    isAdvertising(): Promise<boolean>;
    startAdvertising(deviceName: string, serviceUUIDs?: string[]): Promise<void>;
    stopAdvertising(): Promise<void>;
    setupGatt(maxMtu?: number): Promise<Gatt>;
}
//# sourceMappingURL=Adapter.d.ts.map