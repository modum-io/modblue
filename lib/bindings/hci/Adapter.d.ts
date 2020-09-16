import { BaseAdapter } from '../../Adapter';
import { Noble } from './Noble';
import { Peripheral } from './Peripheral';
export declare class Adapter extends BaseAdapter<Noble> {
    private initialized;
    private scanning;
    private requestScanStop;
    private requestScanRestart;
    private hci;
    private gap;
    private peripherals;
    private uuidToHandle;
    private handleToUUID;
    private connectionRequest;
    private connectionRequestQueue;
    getScannedPeripherals(): Promise<Peripheral[]>;
    isScanning(): Promise<boolean>;
    private init;
    dispose(): void;
    startScanning(): Promise<void>;
    private onScanStart;
    stopScanning(): Promise<void>;
    private onScanStop;
    private onDiscover;
    connect(peripheral: Peripheral, requestedMTU?: number): Promise<void>;
    private onLeConnComplete;
    private onConnectionParameterUpdateRequest;
    private onEncryptChange;
    private onAclDataPkt;
    disconnect(peripheral: Peripheral): Promise<number>;
}
