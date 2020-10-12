import { Noble } from '../../models';
import { HciAdapter } from './Adapter';
export declare class HciNoble extends Noble {
    private adapters;
    init(): Promise<void>;
    dispose(): Promise<void>;
    getAdapters(): Promise<HciAdapter[]>;
}
