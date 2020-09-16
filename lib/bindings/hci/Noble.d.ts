import { BaseAdapter } from '../../Adapter';
import { BaseNoble } from '../../Noble';
export declare class Noble extends BaseNoble {
    private adapters;
    init(): Promise<void>;
    dispose(): Promise<void>;
    getAdapters(): Promise<BaseAdapter<BaseNoble>[]>;
}
