import { GattCharacteristic } from '../../GattCharacteristic';
import { GattService } from '../../GattService';
import { BusObject } from './BusObject';
import { Noble } from './Noble';
import { Peripheral } from './Peripheral';
export declare class Service extends GattService<Noble, Peripheral> {
    private readonly object;
    private characteristics;
    constructor(noble: Noble, peripheral: Peripheral, uuid: string, object: BusObject);
    discoverIncludedServices(serviceUUIDs: string[]): Promise<GattService[]>;
    getDiscoveredCharacteristics(): GattCharacteristic[];
    discoverCharacteristics(characteristicUUIDs?: string[]): Promise<GattCharacteristic[]>;
}
