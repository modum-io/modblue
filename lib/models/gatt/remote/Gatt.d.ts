/// <reference types="node" />
import { Peripheral } from '../../Peripheral';
import { Gatt } from '../Gatt';
import { GattCharacteristicRemote } from './Characteristic';
import { GattDescriptorRemote } from './Descriptor';
import { GattServiceRemote } from './Service';
/**
 * Represents a GATT server on a remote {@link Peripheral}.
 */
export declare abstract class GattRemote extends Gatt {
    /**
     * The peripheral that this GATT server belongs to.
     */
    readonly peripheral: Peripheral;
    /**
     * A map of UUID to services that were discovered during {@link discoverServices}.
     */
    readonly services: Map<string, GattServiceRemote>;
    protected _mtu: number;
    /**
     * The MTU that was agreed upon during the MTU negotiation.
     */
    get mtu(): number;
    constructor(peripheral: Peripheral);
    /**
     * Discover all services of this GATT server.
     */
    discoverServices(): Promise<GattServiceRemote[]>;
    protected abstract doDiscoverServices(): Promise<GattServiceRemote[]>;
    /**
     * Discover all the characteristics of the specified {@link GattServiceRemote}.
     * You can also use {@link GattServiceRemote.discoverCharacteristics}.
     * @param serviceUUID The UUID of the {@link GattServiceRemote}.
     */
    abstract discoverCharacteristics(serviceUUID: string): Promise<GattCharacteristicRemote[]>;
    /**
     * Read the value of the specified {@link GattCharacteristicRemote}.
     * You can also use {@link GattCharacteristicRemote.read}.
     * @param serviceUUID The UUID of the {@link GattServiceRemote}.
     * @param characteristicUUID The UUID of the {@link GattCharacteristicRemote}.
     */
    abstract read(serviceUUID: string, characteristicUUID: string): Promise<Buffer>;
    /**
     * Write the specified Buffer to the specified {@link GattCharacteristicRemote}.
     * You can also use {@link GattCharacteristicRemote.write}.
     * @param serviceUUID The UUID of the {@link GattServiceRemote}.
     * @param characteristicUUID The UUID of the {@link GattCharacteristicRemote}.
     * @param data The data that is written to the characteristic.
     * @param withoutResponse Do not require a response from the remote GATT server for this write.
     */
    abstract write(serviceUUID: string, characteristicUUID: string, data: Buffer, withoutResponse: boolean): Promise<void>;
    abstract broadcast(serviceUUID: string, characteristicUUID: string, broadcast: boolean): Promise<void>;
    abstract notify(serviceUUID: string, characteristicUUID: string, notify: boolean): Promise<void>;
    /**
     * Discover all descriptors of the specified {@link GattCharacteristicRemote}.
     * You can also use {@link GattCharacteristicRemote.discoverDescriptors}.
     * @param serviceUUID The UUID of the {@link GattServiceRemote}.
     * @param characteristicUUID The UUID of the {@link GattCharacteristicRemote}.
     */
    abstract discoverDescriptors(serviceUUID: string, characteristicUUID: string): Promise<GattDescriptorRemote[]>;
    /**
     * Read the value of the specified {@link GattDescriptorRemote}.
     * You can also use {@link GattDescriptorRemote.readValue}.
     * @param serviceUUID The UUID of the {@link GattServiceRemote}.
     * @param characteristicUUID The UUID of the {@link GattCharacteristicRemote}.
     * @param descriptorUUID The UUID of the {@link GattDescriptorRemote}.
     */
    abstract readValue(serviceUUID: string, characteristicUUID: string, descriptorUUID: string): Promise<Buffer>;
    /**
     * Writes the specified Buffer to the specified {@link GattDescriptorRemote}.
     * You can also use {@link GattDescriptorRemote.writeValue}.
     * @param serviceUUID The UUID of the {@link GattServiceRemote}.
     * @param characteristicUUID The UUID of the {@link GattCharacteristicRemote}.
     * @param descriptorUUID The UUID of the {@link GattDescriptorRemote}.
     * @param data The data to write.
     */
    abstract writeValue(serviceUUID: string, characteristicUUID: string, descriptorUUID: string, data: Buffer): Promise<void>;
    toJSON(): {
        mtu: number;
        peripheral: Peripheral;
    };
}
