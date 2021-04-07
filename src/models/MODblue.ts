/* eslint-disable @typescript-eslint/no-var-requires */
import os from 'os';

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

	/**
	 * Tries to automatically detect the current platform and use the most appropriate BLE bindings.
	 */
	public static async autoDetectBindings(): Promise<MODblue> {
		const platform = os.platform();

		if (typeof navigator !== 'undefined' && navigator.bluetooth) {
			return new (await import('../bindings/web')).WebMODblue();
		} /*else if (platform === 'darwin') {
			console.log('using mac');
			return new (require('../bindings/mac').MacMODblue)();
		}*/ else if (
			platform === 'linux' ||
			platform === 'freebsd' ||
			platform === 'win32'
		) {
			return new (await import('../bindings/hci')).HciMODblue();
		} else {
			throw new Error('Unsupported platform');
		}
	}
}
