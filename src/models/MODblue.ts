import { Adapter } from './Adapter';

/**
 * Main class to interface with BLE.
 * Scan for adapters and use an adapter to perform specific actions.
 */
export abstract class MODblue {
	/**
	 * Dispose of these BLE bindings. Object should be considered unusable after this.
	 */
	public abstract dispose(): Promise<void>;

	/**
	 * List all currenctly detected adapters.
	 */
	public abstract getAdapters(): Promise<Adapter[]>;
}
