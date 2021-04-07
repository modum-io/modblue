import { Adapter } from './Adapter';
/**
 * Main class to interface with BLE.
 * Scan for adapters and use an adapter to perform specific actions.
 */
export declare abstract class MODblue {
    /**
     * Dispose of these BLE bindings. Object should be considered unusable after this.
     */
    abstract dispose(): Promise<void>;
    /**
     * List all currenctly detected adapters.
     */
    abstract getAdapters(): Promise<Adapter[]>;
    /**
     * Tries to automatically detect the current platform and use the most appropriate BLE bindings.
     */
    static autoDetectBindings(): Promise<MODblue>;
}
//# sourceMappingURL=MODblue.d.ts.map