import { Adapter } from './Adapter';
export declare abstract class Noble {
    abstract init(): Promise<void>;
    abstract dispose(): Promise<void>;
    abstract getAdapters(): Promise<Adapter[]>;
}
