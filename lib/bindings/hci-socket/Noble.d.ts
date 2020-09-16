import { BaseAdapter } from '../../Adapter';
import { BaseNoble } from '../../Noble';
export declare class Noble extends BaseNoble {
    private adapters;
    init(): Promise<void>;
    getAdapters(): Promise<BaseAdapter<BaseNoble>[]>;
}
