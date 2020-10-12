import { GattCharacteristicProperty, GattCharacteristicRemote } from '../../../models';
import { HciDescriptor } from './Descriptor';
import { HciService } from './Service';
export declare class HciCharacteristic extends GattCharacteristicRemote {
    service: HciService;
    readonly startHandle: number;
    readonly valueHandle: number;
    endHandle: number;
    descriptors: Map<string, HciDescriptor>;
    constructor(service: HciService, uuid: string, properties: GattCharacteristicProperty[], startHandle: number, valueHandle: number);
}
