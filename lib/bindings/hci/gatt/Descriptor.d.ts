import { GattDescriptorRemote } from '../../../models';
import { HciCharacteristic } from './Characteristic';
export declare class HciDescriptor extends GattDescriptorRemote {
    characteristic: HciCharacteristic;
    readonly handle: number;
    constructor(characteristic: HciCharacteristic, uuid: string, handle: number);
}
