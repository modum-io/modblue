import { GattCharacteristic } from '../../../models';
import { HciGattDescriptor } from './Descriptor';
import { HciGattService } from './Service';
export declare class HciGattCharacteristic extends GattCharacteristic {
    service: HciGattService;
    readonly startHandle: number;
    readonly valueHandle: number;
    endHandle: number;
    descriptors: Map<string, HciGattDescriptor>;
    constructor(service: HciGattService, uuid: string, isRemote: boolean, propertiesFlag: number, secureFlag: number, startHandle: number, valueHandle: number);
}
//# sourceMappingURL=Characteristic.d.ts.map