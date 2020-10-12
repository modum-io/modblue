import { Gatt } from './Gatt';
export declare abstract class GattService {
    readonly gatt: Gatt;
    readonly uuid: string;
    constructor(gatt: Gatt, uuid: string);
    toString(): string;
}
