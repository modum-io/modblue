import { BasePeripheral } from '../../Peripheral';
import { Adapter } from './Adapter';
import { Hci } from './hci';
import { Noble } from './Noble';
import { Service } from './Service';
export declare class Peripheral extends BasePeripheral<Noble, Adapter> {
    private hci;
    private handle;
    private gatt;
    private signaling;
    private requestedMTU;
    private services;
    getDiscoveredServices(): Service[];
    connect(requestMtu?: number): Promise<void>;
    onConnect(hci: Hci, handle: number): Promise<void>;
    private onConnectionParameterUpdateRequest;
    disconnect(): Promise<number>;
    onDisconnect(): void;
    discoverServices(serviceUUIDs?: string[]): Promise<Service[]>;
    discoverIncludedServices(baseService: Service, serviceUUIDs?: string[]): Promise<Service[]>;
}
