import { BasePeripheral } from '../../Peripheral';
import { BaseService } from '../../Service';
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
	connect(requestMtu?: number): Promise<void>;
	onConnect(hci: Hci, handle: number): Promise<void>;
	disconnect(): Promise<void>;
	onDisconnect(): Promise<void>;
	getDiscoveredServices(): BaseService[];
	discoverServices(serviceUUIDs?: string[]): Promise<BaseService[]>;
	discoverIncludedServices(baseService: Service, serviceUUIDs?: string[]): Promise<BaseService[]>;
}
