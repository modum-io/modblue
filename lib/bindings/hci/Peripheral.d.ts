import { Peripheral } from '../../Peripheral';
import { Service } from '../../Service';
import { HciAdapter } from './Adapter';
import { Hci } from './hci';
import { HciNoble } from './Noble';
export declare class HciPeripheral extends Peripheral<HciNoble, HciAdapter> {
    private hci;
    private handle;
    private gatt;
    private signaling;
    private requestedMTU;
    private services;
    connect(requestMtu?: number): Promise<void>;
    onConnect(hci: Hci, handle: number): Promise<void>;
    disconnect(): Promise<void>;
    onDisconnect(): Promise<void>;
    getDiscoveredServices(): Service[];
    discoverServices(serviceUUIDs?: string[]): Promise<Service[]>;
    discoverIncludedServices(baseService: Service, serviceUUIDs?: string[]): Promise<Service[]>;
}
