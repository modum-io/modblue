/// <reference types="node" />
import { Adapter } from './Adapter';
import { AddressType } from './AddressType';
import { GattRemote } from './gatt';
/**
 * The current state of the peripheral.
 */
export declare type PeripheralState = 'connecting' | 'connected' | 'disconnecting' | 'disconnected';
/**
 * Connection options used to establish the BLE connection.
 * Certain options are only supported on certain platforms / bindings.
 */
export interface ConnectOptions {
    /**
     * The requested MTU that is sent during the MTU negotiation. Actual mtu may be lower.
     */
    mtu?: number;
    /**
     * The minimum connection interval.
     */
    minInterval?: number;
    /**
     * The maximum connection interval
     */
    maxInterval?: number;
    /**
     * The connection latency.
     */
    latency?: number;
    /**
     * The supervision timeout.
     */
    supervisionTimeout?: number;
}
/**
 * Represents a peripheral that was found during scanning.
 */
export declare abstract class Peripheral {
    /**
     * The adapter that this peripheral was found by.
     */
    readonly adapter: Adapter;
    /**
     * The remote gatt server. Only available after connecting.
     */
    protected _gatt: GattRemote;
    get gatt(): GattRemote;
    /**
     * The unique identifier for this peripheral.
     */
    readonly uuid: string;
    /**
     * The MAC address type of this peripheral.
     */
    readonly addressType: AddressType;
    /**
     * The MAC address of this peripheral. All lowercase, with colon separator between bytes, e.g. 11:22:33:aa:bb:cc
     */
    readonly address: string;
    /**
     * The advertised name of the peripheral.
     */
    name: string;
    /**
     * Any manufacturer advertisement data received from the peripheral. Includes the company identifier.
     */
    manufacturerData: Buffer;
    /**
     * The current RSSI signal strength of the peripheral.
     */
    rssi: number;
    protected _state: PeripheralState;
    /**
     * The current state of the peripheral.
     */
    get state(): PeripheralState;
    constructor(adapter: Adapter, uuid: string, name: string, addressType: AddressType, address: string, advertisement?: Buffer, rssi?: number);
    /**
     * Connect to this peripheral and setup GATT. Throws an error when connecting fails.
     * Some connection settings may not be supported on certain platforms and wil be ignored.
     * @param options The connection options.
     */
    abstract connect(options?: ConnectOptions): Promise<GattRemote>;
    /**
     * Disconnect from this peripheral. Does nothing if not connected. This method **never** throws an error.
     * When connecting to a peripheral you should always wrap your calls in try-catch-finally and call this method at the end.
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
    toString(): string;
    toJSON(): Record<string, unknown>;
}
//# sourceMappingURL=Peripheral.d.ts.map