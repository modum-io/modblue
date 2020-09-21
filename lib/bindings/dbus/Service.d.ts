import { BaseCharacteristic } from '../../Characteristic';
import { BaseService } from '../../Service';
import { BusObject } from './BusObject';
import { Noble } from './Noble';
import { Peripheral } from './Peripheral';
export declare class Service extends BaseService<Noble, Peripheral> {
    private readonly object;
    private characteristics;
    constructor(noble: Noble, peripheral: Peripheral, uuid: string, object: BusObject);
    discoverIncludedServices(serviceUUIDs: string[]): Promise<BaseService[]>;
    getDiscoveredCharacteristics(): BaseCharacteristic[];
    discoverCharacteristics(characteristicUUIDs?: string[]): Promise<BaseCharacteristic[]>;
}
