/// <reference types="node" />
import { EventEmitter } from 'events';
import { AddressType } from '../../types';
export declare interface Gap {
    on(event: 'scanStart', listener: (filterDuplicates: boolean) => void): this;
    on(event: 'scanStop', listener: () => void): this;
    on(event: 'discover', listener: (status: number, address: string, addressType: AddressType, connectable: boolean, advertisement: any, rssi: number) => void): this;
}
export declare class Gap extends EventEmitter {
    private hci;
    private scanState;
    private scanFilterDuplicates;
    private discoveries;
    constructor(hci: any);
    startScanning(allowDuplicates: boolean): void;
    stopScanning(): void;
    private onHciLeScanParametersSet;
    private onHciLeScanEnableSet;
    private onLeScanEnableSetCmd;
    private onHciLeAdvertisingReport;
}
