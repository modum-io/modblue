/// <reference types="node" />
import { Adapter } from '../Adapter';
import { Peripheral } from '../Peripheral';
import { GattCharacteristic } from './Characteristic';
import { GattDescriptor } from './Descriptor';
import { GattService } from './Service';
/**
 * A local or remote GATT server.
 */
export declare abstract class Gatt {
    /**
     * Local: undefined
     * Remote: The peripheral that this GATT server belongs to.
     */
    readonly peripheral: Peripheral;
    /**
     * Local: The adapter that this GATT server belongs to.
     * Remote: undefined
     */
    readonly adapter: Adapter;
    /**
     * True if this is a remote GATT server, false otherwise.
     */
    get isRemote(): boolean;
    /**
     * The services that belong to this GATT server, mapped by UUID.
     * If this is a remote GATT use {@link discoverServices} to discover them.
     */
    readonly services: Map<string, GattService>;
    protected _mtu: number;
    /**
     * Local: The maximum MTU that will agreed upon during negotiation.
     * Remote: The MTU that was agreed upon during negotiation.
     */
    get mtu(): number;
    constructor(peripheral?: Peripheral, adapter?: Adapter, mtu?: number, services?: GattService[]);
    /**
     * Discover all services of this GATT server.
     */
    discoverServices(): Promise<GattService[]>;
    protected abstract doDiscoverServices(): Promise<GattService[]>;
    /**
     * Discover all the characteristics of the specified {@link GattService}.
     * You can also use {@link GattService.discoverCharacteristics}.
     * @param serviceUUID The UUID of the {@link GattService}.
     */
    abstract discoverCharacteristics(serviceUUID: string): Promise<GattCharacteristic[]>;
    /**
     * Read the value of the specified {@link GattCharacteristic}.
     * You can also use {@link GattCharacteristic.read}.
     * @param serviceUUID The UUID of the {@link GattService}.
     * @param characteristicUUID The UUID of the {@link GattCharacteristic}.
     */
    abstract readCharacteristic(serviceUUID: string, characteristicUUID: string): Promise<Buffer>;
    /**
     * Write the specified Buffer to the specified {@link GattCharacteristic}.
     * You can also use {@link GattCharacteristic.write}.
     * @param serviceUUID The UUID of the {@link GattService}.
     * @param characteristicUUID The UUID of the {@link GattCharacteristic}.
     * @param data The data that is written to the characteristic.
     * @param withoutResponse Do not require a response from the remote GATT server for this write.
     */
    abstract writeCharacteristic(serviceUUID: string, characteristicUUID: string, data: Buffer, withoutResponse: boolean): Promise<void>;
    abstract broadcastCharacteristic(serviceUUID: string, characteristicUUID: string, broadcast: boolean): Promise<void>;
    abstract notifyCharacteristic(serviceUUID: string, characteristicUUID: string, notify: boolean): Promise<void>;
    /**
     * Discover all descriptors of the specified {@link GattCharacteristic}.
     * You can also use {@link GattCharacteristic.discoverDescriptors}.
     * @param serviceUUID The UUID of the {@link GattService}.
     * @param characteristicUUID The UUID of the {@link GattCharacteristic}.
     */
    abstract discoverDescriptors(serviceUUID: string, characteristicUUID: string): Promise<GattDescriptor[]>;
    /**
     * Read the value of the specified {@link GattDescriptor}.
     * You can also use {@link GattDescriptor.read}.
     * @param serviceUUID The UUID of the {@link GattService}.
     * @param characteristicUUID The UUID of the {@link GattCharacteristic}.
     * @param descriptorUUID The UUID of the {@link GattDescriptor}.
     */
    abstract readDescriptor(serviceUUID: string, characteristicUUID: string, descriptorUUID: string): Promise<Buffer>;
    /**
     * Writes the specified Buffer to the specified {@link GattDescriptor}.
     * You can also use {@link GattDescriptor.write}.
     * @param serviceUUID The UUID of the {@link GattService}.
     * @param characteristicUUID The UUID of the {@link GattCharacteristic}.
     * @param descriptorUUID The UUID of the {@link GattDescriptor}.
     * @param data The data to write.
     */
    abstract writeDescriptor(serviceUUID: string, characteristicUUID: string, descriptorUUID: string, data: Buffer): Promise<void>;
    toString(): string;
    toJSON(): Record<string, unknown>;
}
//# sourceMappingURL=Gatt.d.ts.map