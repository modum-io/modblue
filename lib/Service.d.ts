import { BaseCharacteristic } from './Characteristic';
import { BaseNoble } from './Noble';
import { BasePeripheral } from './Peripheral';
export declare abstract class BaseService<N extends BaseNoble = BaseNoble, P extends BasePeripheral = BasePeripheral> {
    protected readonly noble: N;
    readonly peripheral: P;
    readonly uuid: string;
    constructor(noble: N, peripheral: P, uuid: string);
    toString(): string;
    abstract discoverIncludedServices(serviceUUIDs: string[]): Promise<BaseService[]>;
    abstract getDiscoveredCharacteristics(): BaseCharacteristic[];
    abstract discoverCharacteristics(characteristicUUIDs?: string[]): Promise<BaseCharacteristic[]>;
}
