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
	on(event: 'stateChange', listener: (state: string) => void): this;
	on(event: 'disconnComplete', listener: (handle: number, reason: number) => void): this;
	on(event: 'encryptChange', listener: (handle: number, encrypt: number) => void): this;
	on(event: 'aclDataPkt', listener: (handle: number, cid: number, data: Buffer) => void): this;
	on(
		event: 'leConnComplete',
		listener: (
			status: number,
			handle: number,
			role: number,
			addressType: AddressType,
			address: string,
			interval: number,
			latency: number,
			supervisionTimeout: number,
			masterClockAccuracy: number
		) => void
	): this;
	on(
		event: 'leAdvertisingReport',
		listener: (_: 0, type: number, address: string, addressType: AddressType, eir: Buffer, rssi: number) => void
	): this;
	on(
		event: 'leConnUpdateComplete',
		listener: (status: number, handle: number, interval: number, latency: number, supervisionTimeout: number) => void
	): this;
}
export declare class Hci extends EventEmitter {
	static STATUS_MAPPER: string[];
	state: string;
	deviceId: number;
	addressType: AddressType;
	address: string;
	private socket;
	private handleBuffers;
	private pollTimer;
	private cmds;
	constructor(deviceId?: number);
	static getDeviceList(): HciDevice[];
	init(): Promise<void>;
	dispose(): void;
	private sendCommand;
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
	createLeConn(address: string, addressType: AddressType): void;
	cancelLeConn(): void;
	connUpdateLe(
		handle: number,
		minInterval: number,
		maxInterval: number,
		latency: number,
		supervisionTimeout: number
	): void;
	startLeEncryption(handle: number, random: any, diversifier: Buffer, key: Buffer): void;
	disconnect(handle: number, reason?: number): void;
	readRssi(handle: number): Promise<number>;
	writeAclDataPkt(handle: number, cid: number, data: Buffer): void;
	readLeBufferSize(): Promise<void>;
	setScanResponseData(data: Buffer): Promise<void>;
	setAdvertisingData(data: Buffer): Promise<void>;
	setAdvertiseEnable(enabled: boolean): Promise<void>;
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
