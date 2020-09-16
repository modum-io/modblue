import { BasePeripheral } from '../../Peripheral';
import { AclStream } from './acl-stream';
import { Adapter } from './Adapter';
import { Gatt } from './gatt';
import { Noble } from './Noble';
import { Service } from './Service';
import { Signaling } from './signaling';
export declare class Peripheral extends BasePeripheral<Noble, Adapter> {
    private aclStream;
    private gatt;
    private signaling;
    getACLStream(): AclStream;
    private services;
    getDiscoveredServices(): Service[];
    connect(requestMtu?: number): Promise<void>;
    onConnect(aclStream: AclStream, gatt: Gatt, signaling: Signaling): void;
    private onMtu;
    disconnect(): Promise<number>;
    onDisconnect(): void;
    discoverServices(serviceUUIDs?: string[]): Promise<Service[]>;
    discoverIncludedServices(baseService: Service, serviceUUIDs?: string[]): Promise<Service[]>;
}
