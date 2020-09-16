import { BaseService } from '../../Service';
import { Characteristic } from './Characteristic';
import { Gatt } from './gatt';
import { Noble } from './Noble';
import { Peripheral } from './Peripheral';
export declare class Service extends BaseService<Noble, Peripheral> {
    private gatt;
    private characteristics;
    getDiscoveredCharacteristics(): Characteristic[];
    constructor(noble: Noble, peripheral: Peripheral, uuid: string, gatt: Gatt);
    discoverIncludedServices(serviceUUIDs?: string[]): Promise<Service[]>;
    discoverCharacteristics(characteristicUUIDs?: string[]): Promise<Characteristic[]>;
}
