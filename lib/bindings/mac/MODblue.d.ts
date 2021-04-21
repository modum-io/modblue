import { Adapter, MODblue } from '../../models';
/**
 * Use the MAC bindings to access BLE functions.
 */
export declare class MacMODblue extends MODblue {
    private adapter;
    dispose(): Promise<void>;
    getAdapters(): Promise<Adapter[]>;
}
//# sourceMappingURL=MODblue.d.ts.map