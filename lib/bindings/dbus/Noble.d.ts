import { MessageBus } from 'dbus-next';
import { Adapter, Noble } from '../../models';
/**
 * Use the DBUS Bluez bindings to access BLE functions.
 */
export declare class DbusNoble extends Noble {
    readonly dbus: MessageBus;
    private objManagerIface;
    private adapters;
    constructor();
    init(): Promise<void>;
    dispose(): Promise<void>;
    getAdapters(): Promise<Adapter[]>;
}
