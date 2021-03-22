/* eslint-disable @typescript-eslint/no-var-requires */

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
	 * @returns The MODblue instance for this platform
	 */
	public static autoDetectBindings(): MODblue {
		const platform = require('os')?.platform();

		if (typeof navigator !== 'undefined' && navigator.bluetooth) {
			console.log('using web');
			return new (require('../bindings/web').WebMODblue)();
		} /*else if (platform === 'darwin') {
			console.log('using mac');
			return new (require('../bindings/mac').MacMODblue)();
		}*/ else if (
			platform === 'linux' ||
			platform === 'freebsd' ||
			platform === 'win32'
		) {
			return new (require('../bindings/hci').HciMODblue)();
		} else {
			throw new Error('Unsupported platform');
		}
	}
}
