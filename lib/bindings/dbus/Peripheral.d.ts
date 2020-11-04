import { Peripheral, Service } from '../../models';
import { AddressType } from '../../types';
import { DbusAdapter } from './Adapter';
import { BusObject } from './BusObject';
import { DbusNoble } from './Noble';
export declare class DbusPeripheral extends Peripheral<DbusNoble, DbusAdapter> {
    private readonly object;
    private services;
    private isConnecting;
    private connecting;
    private connectTimeout;
    private isDisconnecting;
    private disconnecting;
    private disconnectTimeout;
    constructor(noble: DbusNoble, adapter: DbusAdapter, id: string, address: string, addressType: AddressType, object: BusObject);
    private prop;
    private callMethod;
    private isConnected;
    connect(requestMtu?: number): Promise<void>;
    disconnect(): Promise<void>;
    private doneConnecting;
    private doneDisconnecting;
    getDiscoveredServices(): Service[];
    discoverServices(serviceUUIDs?: string[]): Promise<Service[]>;
}
