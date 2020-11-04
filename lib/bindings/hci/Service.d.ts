import { Characteristic } from '../../Characteristic';
import { Service } from '../../Service';
import { Gatt } from './gatt';
import { HciNoble } from './Noble';
import { HciPeripheral } from './Peripheral';
export declare class HciService extends Service<HciNoble, HciPeripheral> {
    private gatt;
    private characteristics;
    constructor(noble: HciNoble, peripheral: HciPeripheral, uuid: string, gatt: Gatt);
    discoverIncludedServices(serviceUUIDs?: string[]): Promise<Service[]>;
    getDiscoveredCharacteristics(): Characteristic[];
    discoverCharacteristics(characteristicUUIDs?: string[]): Promise<Characteristic[]>;
}
