/// <reference types="node" />
import { inspect, InspectOptionsStylized } from 'util';
import { Adapter } from './Adapter';
import { AddressType } from './AddressType';
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
     * Connect to this peripheral. Throws an error when connecting fails.
     * @param minInterval The minimum connection interval.
     * @param maxInterval The maximum connection interval.
     * @param latency The connection latency.
     * @param supervisionTimeout The supervision timeout.
     */
    abstract connect(minInterval?: number, maxInterval?: number, latency?: number, supervisionTimeout?: number): Promise<void>;
    /**
     * Disconnect from this peripheral. Does nothing if not connected. This method **never** throws an error.
     * When connecting to a peripheral you should always wrap your calls in try-catch and call this method at the end.
     * ```
     * try {
     *   peripheral.connect()
     * } catch (err) {
     *   ...
     * } finally {
     *   peripheral.disconnect();
     * }```
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
//# sourceMappingURL=Peripheral.d.ts.map