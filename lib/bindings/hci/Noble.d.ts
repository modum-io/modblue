import { Adapter, Noble } from '../../models';
export declare class HciNoble extends Noble {
    private adapters;
    init(): Promise<void>;
    dispose(): Promise<void>;
    getAdapters(): Promise<Adapter[]>;
}
