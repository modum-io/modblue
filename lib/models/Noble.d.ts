import { Adapter } from './Adapter';
export declare abstract class Noble {
    abstract dispose(): Promise<void>;
    abstract getAdapters(): Promise<Adapter[]>;
}
