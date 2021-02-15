/// <reference types="node" />
import { EventEmitter } from 'events';
import { AddressType } from '../../../types';
declare type DiscoverListener = (address: string, addressType: AddressType, connectable: boolean, advertisement: any, rssi: number) => void;
export declare interface Gap {
    on(event: 'discover', listener: DiscoverListener): this;
}
export declare class Gap extends EventEmitter {
    private hci;
    private advertiseState;
    private scanState;
    private scanFilterDuplicates;
    private discoveries;
    constructor(hci: any);
    startScanning(allowDuplicates: boolean): Promise<void>;
    stopScanning(): Promise<void>;
    startAdvertising(name: string, serviceUuids: string[]): Promise<void>;
    startAdvertisingWithEIRData(advertisementData?: Buffer, scanData?: Buffer): Promise<void>;
    stopAdvertising(): Promise<void>;
    private onHciLeAdvertisingReport;
}
export {};
