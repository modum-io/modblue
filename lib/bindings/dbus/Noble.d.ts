import { Noble } from '../../models';
import { DbusAdapter } from './Adapter';
export declare class DbusNoble extends Noble {
    private readonly dbus;
    private bluezObject;
    private adapters;
    constructor();
    init(): Promise<void>;
    dispose(): Promise<void>;
    getAdapters(): Promise<DbusAdapter[]>;
}
