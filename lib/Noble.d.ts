import { BaseAdapter } from './Adapter';
export declare abstract class BaseNoble {
    protected _state: string;
    get state(): string;
    protected _address: string;
    get address(): string;
    abstract init(): Promise<void>;
    abstract dispose(): Promise<void>;
    abstract getAdapters(): Promise<BaseAdapter[]>;
}
