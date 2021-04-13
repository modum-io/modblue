import { Adapter, MODblue } from '../../models';
/**
 * Use the WIN bindings to access BLE functions.
 */
export declare class WinMODblue extends MODblue {
    private adapter;
    dispose(): Promise<void>;
    getAdapters(): Promise<Adapter[]>;
}
//# sourceMappingURL=MODblue.d.ts.map