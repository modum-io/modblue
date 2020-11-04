import { Adapter } from '../../Adapter';
import { Noble } from '../../Noble';
export declare class DbusNoble extends Noble {
    private readonly dbus;
    private bluezObject;
    private adapters;
    constructor();
    init(): Promise<void>;
    dispose(): Promise<void>;
    getAdapters(): Promise<Adapter[]>;
}
