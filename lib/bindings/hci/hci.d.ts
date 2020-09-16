/// <reference types="node" />
import { EventEmitter } from 'events';
import { AddressType } from '../../types';
interface HciDevice {
    devId: number;
    devUp: boolean;
}
export declare interface Hci {
    on(event: 'stateChange', listener: (state: string) => void): this;
    on(event: 'addressChange', listener: (address: string) => void): this;
    on(event: 'disconnComplete', listener: (handle: number, reason: number) => void): this;
    on(event: 'encryptChange', listener: (handle: number, encrypt: number) => void): this;
    on(event: 'aclDataPkt', listener: (handle: number, cid: number, data: Buffer) => void): this;
    on(event: 'readLocalVersion', listener: (hciVer: number, hciRev: number, lmpVer: number, manufacturer: number, lmpSubVer: number) => void): this;
    on(event: 'rssiRead', listener: (handle: number, rssi: number) => void): this;
    on(event: 'leScanEnableSetCmd', listener: (enable: boolean, filterDuplicates: boolean) => void): this;
    on(event: 'leScanParametersSet', listener: () => void): this;
    on(event: 'leScanEnableSet', listener: (status: number) => void): this;
    on(event: 'leConnComplete', listener: (status: number, handle: number, role: number, addressType: AddressType, address: string, interval: number, latency: number, supervisionTimeout: number, masterClockAccuracy: number) => void): this;
    on(event: 'leAdvertisingReport', listener: (_: 0, type: number, address: string, addressType: AddressType, eir: Buffer, rssi: number) => void): this;
    on(event: 'leConnUpdateComplete', listener: (status: number, handle: number, interval: number, latency: number, supervisionTimeout: number) => void): this;
}
export declare class Hci extends EventEmitter {
    static STATUS_MAPPER: string[];
    addressType: AddressType;
    address: string;
    isUp: boolean;
    state: string;
    deviceId: number;
    private socket;
    private handleBuffers;
    private pollTimer;
    constructor(deviceId?: number);
    static getDeviceList(): HciDevice[];
    init(): Promise<void>;
    private pollIsDevUp;
    private setSocketFilter;
    private setEventMask;
    private reset;
    private readLocalVersion;
    private readBdAddr;
    private setLeEventMask;
    private readLeHostSupported;
    private writeLeHostSupported;
    setScanParameters(): void;
    setScanEnabled(enabled: boolean, filterDuplicates: boolean): void;
    createLeConn(address: string, addressType: AddressType): void;
    connUpdateLe(handle: number, minInterval: number, maxInterval: number, latency: number, supervisionTimeout: number): void;
    startLeEncryption(handle: number, random: any, diversifier: Buffer, key: Buffer): void;
    disconnect(handle: number, reason?: number): void;
    readRssi(handle: number): void;
    writeAclDataPkt(handle: number, cid: number, data: Buffer): void;
    private onSocketData;
    private onSocketError;
    private processCmdCompleteEvent;
    private processLeMetaEvent;
    private processLeConnComplete;
    private processLeAdvertisingReport;
    private processLeConnUpdateComplete;
    private processCmdStatusEvent;
    private onStateChange;
}
export {};
