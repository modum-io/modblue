import { AddressType } from '../types';
import { Adapter } from './Adapter';
import { GattRemote } from './gatt';
export declare type PeripheralState = 'connecting' | 'connected' | 'disconnecting' | 'disconnected';
export declare abstract class Peripheral {
    readonly adapter: Adapter;
    readonly uuid: string;
    readonly addressType: AddressType;
    readonly address: string;
    advertisement: any;
    rssi: number;
    protected _state: PeripheralState;
    get state(): PeripheralState;
    constructor(adapter: Adapter, uuid: string, addressType: AddressType, address: string, advertisement?: any, rssi?: number);
    toString(): string;
    abstract connect(): Promise<void>;
    abstract disconnect(): Promise<void>;
    abstract setupGatt(requestMtu?: number): Promise<GattRemote>;
}
