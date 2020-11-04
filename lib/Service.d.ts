import { Characteristic } from './Characteristic';
import { Noble } from './Noble';
import { Peripheral } from './Peripheral';
export declare abstract class Service<N extends Noble = Noble, P extends Peripheral = Peripheral> {
    protected readonly noble: N;
    readonly peripheral: P;
    readonly uuid: string;
    constructor(noble: N, peripheral: P, uuid: string);
    toString(): string;
    abstract discoverIncludedServices(serviceUUIDs: string[]): Promise<Service[]>;
    abstract getDiscoveredCharacteristics(): Characteristic[];
    abstract discoverCharacteristics(characteristicUUIDs?: string[]): Promise<Characteristic[]>;
}
