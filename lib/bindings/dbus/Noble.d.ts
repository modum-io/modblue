import { MessageBus } from 'dbus-next';
import { Noble } from '../../models';
import { DbusAdapter } from './Adapter';
export declare class DbusNoble extends Noble {
    readonly dbus: MessageBus;
    private objManagerIface;
    private adapters;
    constructor();
    dispose(): Promise<void>;
    getAdapters(): Promise<DbusAdapter[]>;
}
