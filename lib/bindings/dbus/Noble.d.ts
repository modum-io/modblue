import { BaseAdapter } from '../../Adapter';
import { BaseNoble } from '../../Noble';
export declare class Noble extends BaseNoble {
    private readonly dbus;
    private bluezObject;
    private adapters;
    constructor();
    init(): Promise<void>;
    dispose(): Promise<void>;
    getAdapters(): Promise<BaseAdapter[]>;
}
