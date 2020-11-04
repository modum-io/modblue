import { Adapter } from '../../Adapter';
import { Peripheral } from '../../Peripheral';
import { HciNoble } from './Noble';
import { HciPeripheral } from './Peripheral';
export declare class HciAdapter extends Adapter<HciNoble> {
    private initialized;
    private scanning;
    private hci;
    private gap;
    private peripherals;
    private uuidToHandle;
    private handleToUUID;
    getScannedPeripherals(): Promise<Peripheral[]>;
    isScanning(): Promise<boolean>;
    private init;
    dispose(): void;
    startScanning(): Promise<void>;
    stopScanning(): Promise<void>;
    private onDiscover;
    connect(peripheral: HciPeripheral): Promise<void>;
    disconnect(peripheral: HciPeripheral): Promise<void>;
}
