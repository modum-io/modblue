import { BasePeripheral } from '../../Peripheral';
import { BaseService } from '../../Service';
import { AddressType } from '../../types';
import { Adapter } from './Adapter';
import { BusObject } from './BusObject';
import { Noble } from './Noble';
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
    disconnect(): Promise<void>;
    private doneConnecting;
    private doneDisconnecting;
    getDiscoveredServices(): BaseService[];
    discoverServices(serviceUUIDs?: string[]): Promise<BaseService[]>;
}
