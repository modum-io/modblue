/// <reference types="node" />
import { EventEmitter } from 'events';
export declare class Gap extends EventEmitter {
    private hci;
    private scanState;
    private scanFilterDuplicates;
    private discoveries;
    constructor(hci: any);
    startScanning(allowDuplicates: boolean): void;
    stopScanning(): void;
    private onHciError;
    private onHciLeScanParametersSet;
    private onHciLeScanEnableSet;
    private onLeScanEnableSetCmd;
    private onHciLeAdvertisingReport;
}
