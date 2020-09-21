import { BasePeripheral } from '../../Peripheral';
import { AddressType } from '../../types';
import { Adapter } from './Adapter';
import { BusObject } from './BusObject';
import { Noble } from './Noble';
import { Service } from './Service';
export declare class Peripheral extends BasePeripheral<Noble, Adapter> {
    private readonly object;
    private services;
    private isConnecting;
    private connecting;
    private connectTimeout;
    private isDisconnecting;
    private disconnecting;
    private disconnectTimeout;
    constructor(noble: Noble, adapter: Adapter, id: string, address: string, addressType: AddressType, object: BusObject);
    private prop;
    private callMethod;
    private isConnected;
    connect(requestMtu?: number): Promise<void>;
    disconnect(): Promise<number>;
    private doneConnecting;
    private doneDisconnecting;
    getDiscoveredServices(): Service[];
    discoverServices(serviceUUIDs?: string[]): Promise<Service[]>;
}
