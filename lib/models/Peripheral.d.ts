/// <reference types="node" />
import { inspect, InspectOptionsStylized } from 'util';
import { AddressType } from '../types';
import { Adapter } from './Adapter';
import { GattRemote } from './gatt';
/**
 * The current state of the peripheral.
 */
export declare type PeripheralState = 'connecting' | 'connected' | 'disconnecting' | 'disconnected';
/**
 * Represents a peripheral that was found during scanning.
 */
export declare abstract class Peripheral {
    /**
     * The adapter that this peripheral was found by.
     */
    readonly adapter: Adapter;
    /**
     * The unique identifier for this peripheral.
     */
    readonly uuid: string;
    /**
     * The MAC address type of this peripheral.
     */
    readonly addressType: AddressType;
    /**
     * The MAC address of this peripheral.
     */
    readonly address: string;
    /**
     * Any advertisement data received from the peripheral. Usually a buffer.
     */
    advertisement: any;
    /**
     * The current RSSI signal strength of the peripheral.
     */
    rssi: number;
    protected _state: PeripheralState;
    /**
     * The current state of the peripheral.
     */
    get state(): PeripheralState;
    constructor(adapter: Adapter, uuid: string, addressType: AddressType, address: string, advertisement?: any, rssi?: number);
    /**
     * Connect to this peripheral. Does nothing if already connected.
     */
    abstract connect(): Promise<void>;
    /**
     * Disconnect from this peripheral. Does nothing if not connected.
     */
    abstract disconnect(): Promise<void>;
    /**
     * Setup the local GATT server to send and receive data from the remote GATT server of the peripheral.
     * Requires an existing connection.
     * @param requestMtu The requested MTU that is sent during the MTU negotiation. Actual mtu may be lower.
     */
    abstract setupGatt(requestMtu?: number): Promise<GattRemote>;
    toString(): string;
    toJSON(): {
        uuid: string;
        address: string;
        addressType: AddressType;
        rssi: number;
        state: PeripheralState;
        adapter: Adapter;
    };
    [inspect.custom](depth: number, options: InspectOptionsStylized): string;
}
