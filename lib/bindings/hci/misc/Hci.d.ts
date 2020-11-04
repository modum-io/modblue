/// <reference types="node" />
import { EventEmitter } from 'events';
import { AddressType } from '../../../types';
interface HciDevice {
    devId: number;
    devUp: boolean;
    idVendor: null;
    idProduct: null;
    busNumber: null;
    name: string;
    address: string;
}
export declare interface Hci {
    on(event: 'aclDataPkt', listener: (handle: number, cid: number, data: Buffer) => void): this;
    on(event: 'leAdvertisingReport', listener: (_: 0, type: number, address: string, addressType: AddressType, eir: Buffer, rssi: number) => void): this;
}
export declare class Hci extends EventEmitter {
    static STATUS_MAPPER: string[];
    state: string;
    deviceId: number;
    addressType: AddressType;
    address: string;
    private socket;
    private handleBuffers;
    private cmds;
    constructor(deviceId?: number);
    static getDeviceList(): HciDevice[];
    init(): Promise<void>;
    dispose(): void;
    private sendCommand;
    private waitForEvent;
    private waitForLeMetaEvent;
    private setSocketFilter;
    private setEventMask;
    private reset;
    private readLocalVersion;
    private readBdAddr;
    private setLeEventMask;
    private readLeHostSupported;
    private writeLeHostSupported;
    setScanParameters(): Promise<void>;
    setScanEnabled(enabled: boolean, filterDuplicates: boolean): Promise<void>;
    createLeConn(address: string, addressType: AddressType): Promise<{
        handle: number;
        role: number;
        interval: number;
        latency: number;
        supervisionTimeout: number;
        masterClockAccuracy: number;
    }>;
    cancelLeConn(): Promise<void>;
    connUpdateLe(handle: number, minInterval: number, maxInterval: number, latency: number, supervisionTimeout: number): void;
    startLeEncryption(handle: number, random: any, diversifier: Buffer, key: Buffer): void;
    disconnect(handle: number, reason?: number): Promise<void>;
    readRssi(handle: number): Promise<number>;
    writeAclDataPkt(handle: number, cid: number, data: Buffer): void;
    readLeBufferSize(): Promise<void>;
    setScanResponseData(data: Buffer): Promise<void>;
    setAdvertisingData(data: Buffer): Promise<void>;
    setAdvertisingEnabled(enabled: boolean): Promise<void>;
    private onSocketData;
    private onSocketError;
    private processLeAdvertisingReport;
}
export {};
