import { BaseNoble } from '../../Noble';
import { Adapter } from './Adapter';
export declare class Noble extends BaseNoble {
    private adapters;
    init(): Promise<void>;
    dispose(): Promise<void>;
    getAdapters(): Promise<Adapter[]>;
}
