/// <reference types="node" />
import { EventEmitter } from 'events';
import { AddressType } from '../../../types';
export declare interface Gap {
    on(event: 'scanStart', listener: (filterDuplicates: boolean) => void): this;
    on(event: 'scanStop', listener: () => void): this;
    on(event: 'discover', listener: (status: number, address: string, addressType: AddressType, connectable: boolean, advertisement: any, rssi: number) => void): this;
    on(event: 'advertisingStart', listener: () => void): this;
    on(event: 'advertisingStop', listener: () => void): this;
}
export declare class Gap extends EventEmitter {
    private hci;
    private scanState;
    private advertiseState;
    private scanFilterDuplicates;
    private discoveries;
    constructor(hci: any);
    startScanning(allowDuplicates: boolean): void;
    stopScanning(): void;
    startAdvertising(name: string, serviceUuids: string[]): void;
    startAdvertisingWithEIRData(advertisementData: Buffer, scanData: Buffer): void;
    stopAdvertising(): void;
    private onHciLeScanParametersSet;
    private onHciLeScanEnableSet;
    private onLeScanEnableSetCmd;
    private onHciLeAdvertisingReport;
    private onHciLeAdvertisingParametersSet;
    private onHciLeAdvertisingDataSet;
    onHciLeScanResponseDataSet: (status: number) => void;
    onHciLeAdvertiseEnableSet: (status: number) => void;
}
