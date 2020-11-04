import { Adapter } from '../../Adapter';
import { Noble } from '../../Noble';
export declare class HciNoble extends Noble {
    private adapters;
    init(): Promise<void>;
    dispose(): Promise<void>;
    getAdapters(): Promise<Adapter[]>;
}
