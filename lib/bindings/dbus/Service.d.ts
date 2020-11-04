import { Characteristic } from '../../Characteristic';
import { Service } from '../../Service';
import { BusObject } from './BusObject';
import { DbusNoble } from './Noble';
import { DbusPeripheral } from './Peripheral';
export declare class DbusService extends Service<DbusNoble, DbusPeripheral> {
    private readonly object;
    private characteristics;
    constructor(noble: DbusNoble, peripheral: DbusPeripheral, uuid: string, object: BusObject);
    discoverIncludedServices(serviceUUIDs: string[]): Promise<Service[]>;
    getDiscoveredCharacteristics(): Characteristic[];
    discoverCharacteristics(characteristicUUIDs?: string[]): Promise<Characteristic[]>;
}
