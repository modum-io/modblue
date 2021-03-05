import { Adapter, MODblue } from '../../models';
/**
 * Use the HCI socket bindings to access BLE functions.
 */
export declare class HciMODblue extends MODblue {
    private adapters;
    dispose(): Promise<void>;
    getAdapters(): Promise<Adapter[]>;
}
