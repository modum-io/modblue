/// <reference types="node" />
import { GattCharacteristic } from '../Characteristic';
import { GattDescriptorRemote } from './Descriptor';
import { GattServiceRemote } from './Service';
/**
 * Represents a characteristic connected to a remote GATT service.
 */
export declare class GattCharacteristicRemote extends GattCharacteristic {
    /**
     * The service that this characteristic belongs to.
     */
    readonly service: GattServiceRemote;
    protected get gatt(): import("./Gatt").GattRemote;
    /**
     * A map of UUID to descriptor that were discovered during {@link discoverDescriptors}.
     */
    readonly descriptors: Map<string, GattDescriptorRemote>;
    /**
     * Read the current value of this characteristic.
     */
    read(): Promise<Buffer>;
    /**
     * Write the specified data to this characteristic.
     * @param data The data to write.
     * @param withoutResponse Do not require a response from the remote GATT server for this write.
     */
    write(data: Buffer, withoutResponse: boolean): Promise<void>;
    broadcast(broadcast: boolean): Promise<void>;
    notify(notify: boolean): Promise<void>;
    subscribe(): Promise<void>;
    unsubscribe(): Promise<void>;
    /**
     * Discover all descriptors of this characteristic.
     */
    discoverDescriptors(): Promise<GattDescriptorRemote[]>;
}
