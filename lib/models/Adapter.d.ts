import { TypedEmitter } from 'tiny-typed-emitter';
import { AddressType } from '../types';
import { GattLocal } from './gatt';
import { Noble } from './Noble';
import { Peripheral } from './Peripheral';
export interface AdapterEvents {
    discover: (peripheral: Peripheral) => void;
    connect: (peripheral: Peripheral) => void;
    disconnect: (peripheral: Peripheral, reason?: number) => void;
}
export declare abstract class Adapter extends TypedEmitter<AdapterEvents> {
    /**
     * The instance of noble that this adapter was found by.
     */
    readonly noble: Noble;
    /**
     * The unique identifier of this adapter.
     */
    readonly id: string;
    protected _name: string;
    /**
     * The public name of this adapter.
     */
    get name(): string;
    protected _addressType: AddressType;
    /**
     * The MAC address type of this adapter.
     */
    get addressType(): AddressType;
    protected _address: string;
    /**
     * The MAC address of this adapter.
     */
    get address(): string;
    constructor(noble: Noble, id: string, name?: string, address?: string);
    toString(): string;
    /**
     * Scans for a specific {@link Peripheral} using the specified matching function and returns the peripheral once found.
     * If the timeout is reached before finding a peripheral the returned promise will be rejected.
     * @param isTarget A function that returns `true` if the specified peripheral is the peripheral we're looking for.
     * @param timeoutInSeconds The timeout in seconds. The returned promise will reject once the timeout is reached.
     * @param serviceUUIDs The UUIDs of the {@link GattServiceRemote}s that must be contained in the advertisement data.
     */
    scanFor(isTarget: (peripheral: Peripheral) => boolean, timeoutInSeconds?: number, serviceUUIDs?: []): Promise<Peripheral>;
    /**
     * Returns `true` if this adapter is currently scanning, `false` otherwise.
     */
    abstract isScanning(): Promise<boolean>;
    /**
     * Start scanning for nearby {@link Peripheral}s.
     * @param serviceUUIDs The UUIDs of the {@link GattServiceRemote} that an advertising
     * packet must advertise to emit a `discover` event.
     * @param allowDuplicates True if advertisements for the same peripheral should emit multiple `discover` events.
     */
    abstract startScanning(serviceUUIDs?: string[], allowDuplicates?: boolean): Promise<void>;
    /**
     * Stop scanning for peripherals.
     */
    abstract stopScanning(): Promise<void>;
    /**
     * Get all peripherals that were found since the last scan start.
     */
    abstract getScannedPeripherals(): Promise<Peripheral[]>;
    /**
     * Start advertising on this adapter.
     * @param deviceName The device name that is included in the advertisement.
     * @param serviceUUIDs The UUIDs of the {@link GattServiceLocal}s that are included in the advertisement.
     */
    abstract startAdvertising(deviceName: string, serviceUUIDs?: string[]): Promise<void>;
    /**
     * Stop any ongoing advertisements.
     */
    abstract stopAdvertising(): Promise<void>;
    /**
     * Setup the GATT server for this adapter to communicate with connecting remote peripherals.
     * @param maxMtu The maximum MTU that will be negotiated in case the remote peripheral starts an MTU negotation.
     */
    abstract setupGatt(maxMtu?: number): Promise<GattLocal>;
}
