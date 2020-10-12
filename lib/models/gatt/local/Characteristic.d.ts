import { GattCharacteristic, GattCharacteristicProperty } from '../Characteristic';
import { GattDescriptorLocal } from './Descriptor';
import { GattServiceLocal } from './Service';
export declare class GattCharacteristicLocal extends GattCharacteristic {
    readonly service: GattServiceLocal;
    readonly descriptors: GattDescriptorLocal[];
    constructor(service: GattServiceLocal, uuid: string, properties: GattCharacteristicProperty[], descriptors: GattDescriptorLocal[]);
}
