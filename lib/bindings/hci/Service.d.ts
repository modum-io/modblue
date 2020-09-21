import { BaseCharacteristic } from '../../Characteristic';
import { BaseService } from '../../Service';
import { Gatt } from './gatt';
import { Noble } from './Noble';
import { Peripheral } from './Peripheral';
export declare class Service extends BaseService<Noble, Peripheral> {
    private gatt;
    private characteristics;
    constructor(noble: Noble, peripheral: Peripheral, uuid: string, gatt: Gatt);
    discoverIncludedServices(serviceUUIDs?: string[]): Promise<BaseService[]>;
    getDiscoveredCharacteristics(): BaseCharacteristic[];
    discoverCharacteristics(characteristicUUIDs?: string[]): Promise<BaseCharacteristic[]>;
}
