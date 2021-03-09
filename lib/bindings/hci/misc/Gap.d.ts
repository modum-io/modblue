/// <reference types="node" />
import { TypedEmitter } from 'tiny-typed-emitter';
import { AddressType } from '../../../models';
import { Hci } from './Hci';
interface Advertisement {
    localName: string;
    txPowerLevel: number;
    manufacturerData: Buffer;
    serviceData: {
        uuid: string;
        data: Buffer;
    }[];
    serviceUuids: string[];
    solicitationServiceUuids: string[];
}
interface GapEvents {
    discover: (address: string, addressType: AddressType, connectable: boolean, advertisement: Advertisement, rssi: number) => void;
}
export declare class Gap extends TypedEmitter<GapEvents> {
    private hci;
    private advertiseState;
    private scanState;
    private scanFilterDuplicates;
    private discoveries;
    constructor(hci: Hci);
    startScanning(allowDuplicates: boolean): Promise<void>;
    stopScanning(): Promise<void>;
    startAdvertising(name: string, serviceUuids: string[]): Promise<void>;
    startAdvertisingWithEIRData(advertisementData?: Buffer, scanData?: Buffer): Promise<void>;
    stopAdvertising(): Promise<void>;
    private onHciLeAdvertisingReport;
}
export {};
//# sourceMappingURL=Gap.d.ts.map