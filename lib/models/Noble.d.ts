import { Adapter } from './Adapter';
/**
 * Main class to interface with BLE.
 * Scan for adapters and use an adapter to perform specific actions.
 */
export declare abstract class Noble {
    /**
     * Initialize the BLE bindings. Only has to be called once at the start.
     */
    abstract init(): Promise<void>;
    /**
     * Dispose of these BLE bindings. Object should be considered unusable after this.
     */
    abstract dispose(): Promise<void>;
    /**
     * List all currenctly detected adapters.
     */
    abstract getAdapters(): Promise<Adapter[]>;
}
