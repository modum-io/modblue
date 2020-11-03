import { BaseAdapter } from './Adapter';
import { BaseNoble } from './Noble';
import { BaseService } from './Service';
import { AddressType, PeripheralState } from './types';
export declare abstract class BasePeripheral<N extends BaseNoble = BaseNoble, A extends BaseAdapter = BaseAdapter> {
    protected readonly noble: N;
    readonly adapter: A;
    readonly uuid: string;
    readonly address: string;
    readonly addressType: AddressType;
    connectable: boolean;
    advertisement: any;
    rssi: number;
    protected _state: PeripheralState;
    get state(): PeripheralState;
    protected _mtu: number;
    get mtu(): number;
    constructor(noble: N, adapter: A, uuid: string, address: string, addressType: AddressType, connectable?: boolean, advertisement?: any, rssi?: number);
    toString(): string;
    abstract connect(requestMtu?: number): Promise<void>;
    abstract disconnect(): Promise<void>;
    abstract getDiscoveredServices(): BaseService[];
    abstract discoverServices(serviceUUIDs?: string[]): Promise<BaseService[]>;
}
