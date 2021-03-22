import { Adapter, Gatt, MODblue, Peripheral } from '../../models';
export declare class WebAdapter extends Adapter {
    private scan;
    private peripherals;
    constructor(modblue: MODblue, id: string, name?: string, address?: string);
    dispose(): void;
    private addDashes;
    isScanning(): Promise<boolean>;
    startScanning(serviceUUIDs?: string[]): Promise<void>;
    private onAdvertisement;
    stopScanning(): Promise<void>;
    getScannedPeripherals(): Promise<Peripheral[]>;
    isAdvertising(): Promise<boolean>;
    startAdvertising(deviceName: string, serviceUUIDs?: string[]): Promise<void>;
    stopAdvertising(): Promise<void>;
    setupGatt(maxMtu?: number): Promise<Gatt>;
}
//# sourceMappingURL=Adapter.d.ts.map