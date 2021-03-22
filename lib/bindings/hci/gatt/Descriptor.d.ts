import { GattDescriptor } from '../../../models';
import { HciGattCharacteristic } from './Characteristic';
export declare class HciGattDescriptor extends GattDescriptor {
    characteristic: HciGattCharacteristic;
    readonly handle: number;
    constructor(characteristic: HciGattCharacteristic, uuid: string, isRemote: boolean, handle: number);
}
//# sourceMappingURL=Descriptor.d.ts.map