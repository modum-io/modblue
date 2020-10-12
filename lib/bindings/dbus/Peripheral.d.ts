import { Peripheral } from '../../models';
import { AddressType } from '../../types';
import { DbusAdapter } from './Adapter';
import { DbusGattRemote, DbusGattServiceRemote } from './gatt';
import { BusObject } from './misc';
export declare class DbusPeripheral extends Peripheral {
    private readonly busObject;
    private gatt;
    services: Map<string, DbusGattServiceRemote>;
    private isConnecting;
    private connecting;
    private connectTimeout;
    private isDisconnecting;
    private disconnecting;
    private disconnectTimeout;
    constructor(adapter: DbusAdapter, id: string, address: string, addressType: AddressType, busObject: BusObject);
    private prop;
    private callMethod;
    private isConnected;
    connect(requestMtu?: number): Promise<void>;
    disconnect(): Promise<number>;
    private doneConnecting;
    private doneDisconnecting;
    setupGatt(requestMtu?: number): Promise<DbusGattRemote>;
}
