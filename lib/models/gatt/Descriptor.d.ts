import { GattCharacteristic } from './Characteristic';
export declare abstract class GattDescriptor {
    readonly characteristic: GattCharacteristic;
    readonly uuid: string;
    constructor(characteristic: GattCharacteristic, uuid: string);
    toString(): string;
}
