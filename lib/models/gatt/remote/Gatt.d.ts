/// <reference types="node" />
import { Peripheral } from '../../Peripheral';
import { Gatt } from '../Gatt';
import { GattCharacteristicRemote } from './Characteristic';
import { GattDescriptorRemote } from './Descriptor';
import { GattServiceRemote } from './Service';
export declare abstract class GattRemote extends Gatt {
    readonly peripheral: Peripheral;
    readonly services: Map<string, GattServiceRemote>;
    protected _mtu: number;
    get mtu(): number;
    constructor(peripheral: Peripheral);
    toString(): string;
    discoverServices(): Promise<GattServiceRemote[]>;
    protected abstract doDiscoverServices(): Promise<GattServiceRemote[]>;
    abstract discoverCharacteristics(serviceUUID: string): Promise<GattCharacteristicRemote[]>;
    abstract read(serviceUUID: string, characteristicUUID: string): Promise<Buffer>;
    abstract write(serviceUUID: string, characteristicUUID: string, data: Buffer, withoutResponse: boolean): Promise<void>;
    abstract broadcast(serviceUUID: string, characteristicUUID: string, broadcast: boolean): Promise<void>;
    abstract notify(serviceUUID: string, characteristicUUID: string, notify: boolean): Promise<void>;
    abstract discoverDescriptors(serviceUUID: string, characteristicUUID: string): Promise<GattDescriptorRemote[]>;
    abstract readValue(serviceUUID: string, characteristicUUID: string, descriptorUUID: string): Promise<Buffer>;
    abstract writeValue(serviceUUID: string, characteristicUUID: string, descriptorUUID: string, data: Buffer): Promise<void>;
}
