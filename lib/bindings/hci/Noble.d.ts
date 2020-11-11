import { Adapter, Noble } from '../../models';
/**
 * Use the HCI socket bindings to access BLE functions.
 */
export declare class HciNoble extends Noble {
    private adapters;
    init(): Promise<void>;
    dispose(): Promise<void>;
    getAdapters(): Promise<Adapter[]>;
}
