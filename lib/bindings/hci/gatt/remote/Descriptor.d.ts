import { GattDescriptorRemote } from '../../../../models';
import { HciGattCharacteristicRemote } from './Characteristic';
export declare class HciGattDescriptorRemote extends GattDescriptorRemote {
    characteristic: HciGattCharacteristicRemote;
    readonly handle: number;
    constructor(characteristic: HciGattCharacteristicRemote, uuid: string, handle: number);
}
