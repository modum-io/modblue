import { BaseAdapter } from './Adapter';
export declare abstract class BaseNoble {
    abstract init(): Promise<void>;
    abstract dispose(): Promise<void>;
    abstract getAdapters(): Promise<BaseAdapter[]>;
}
