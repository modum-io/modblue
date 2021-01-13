import { MessageBus } from 'dbus-next';
import { Adapter, MODblue } from '../../models';
/**
 * Use the DBUS Bluez bindings to access BLE functions.
 */
export declare class DbusMODblue extends MODblue {
    readonly dbus: MessageBus;
    private objManagerIface;
    private adapters;
    constructor();
    dispose(): Promise<void>;
    getAdapters(): Promise<Adapter[]>;
}
