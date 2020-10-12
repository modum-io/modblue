import { GattCharacteristic } from '../../GattCharacteristic';
import { GattService } from '../../GattService';
import { Gatt } from './gatt';
import { Noble } from './Noble';
import { Peripheral } from './Peripheral';
export declare class Service extends GattService<Noble, Peripheral> {
    private gatt;
    private characteristics;
    constructor(noble: Noble, peripheral: Peripheral, uuid: string, gatt: Gatt);
    discoverIncludedServices(serviceUUIDs?: string[]): Promise<GattService[]>;
    getDiscoveredCharacteristics(): GattCharacteristic[];
    discoverCharacteristics(characteristicUUIDs?: string[]): Promise<GattCharacteristic[]>;
}
