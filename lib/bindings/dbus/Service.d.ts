import { BaseService } from '../../Service';
import { BusObject } from './BusObject';
import { Characteristic } from './Characteristic';
import { Noble } from './Noble';
import { Peripheral } from './Peripheral';
export declare class Service extends BaseService<Noble, Peripheral> {
    private readonly object;
    private characteristics;
    constructor(noble: Noble, peripheral: Peripheral, uuid: string, object: BusObject);
    discoverIncludedServices(serviceUUIDs: string[]): Promise<Service[]>;
    getDiscoveredCharacteristics(): Characteristic[];
    discoverCharacteristics(characteristicUUIDs?: string[]): Promise<Characteristic[]>;
}
