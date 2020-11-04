import { Adapter } from './Adapter';
import { Noble } from './Noble';
import { Service } from './Service';
import { AddressType, PeripheralState } from './types';
export declare abstract class Peripheral<N extends Noble = Noble, A extends Adapter = Adapter> {
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
    abstract getDiscoveredServices(): Service[];
    abstract discoverServices(serviceUUIDs?: string[]): Promise<Service[]>;
}
