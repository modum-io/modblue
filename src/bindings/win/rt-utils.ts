// Utility functions for working with NodeRT projections.

declare global {
	const Windows: any;
}

// Relative path to NodeRT-generaged UWP namespace modules.

// Require a NodeRt namespace package and load it into the global namespace.
export function using(path: string, ns: string): void {
	const nsParts = ns.split('/').slice(-1)[0].split('.');
	let parentObj: any = global;

	// Build an object tree as necessary for the namespace hierarchy.
	for (let i = 0; i < nsParts.length - 1; i++) {
		let nsObj = parentObj[nsParts[i]];
		if (!nsObj) {
			nsObj = {};
			parentObj[nsParts[i]] = nsObj;
		}
		parentObj = nsObj;
	}

	const lastNsPart = nsParts[nsParts.length - 1];
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const nsPackage = require(path);

	// Merge in any already-loaded sub-namespaces.
	// This allows loading in non-hierarchical order.
	const nsObj = parentObj[lastNsPart];
	if (nsObj) {
		Object.keys(nsObj).forEach((key) => {
			nsPackage[key] = nsObj[key];
		});
	}
	parentObj[lastNsPart] = nsPackage;
}

// Convert a NodeRT async method from callback to promise.
export function promisify(fn: () => void, o?: unknown) {
	return (...args: unknown[]): Promise<unknown> => {
		return new Promise((resolve, reject) => {
			(o ? fn.bind(o) : fn)(...args, (err: Error, result: unknown) => {
				if (err) reject(err);
				else resolve(result);
			});
		});
	};
}

// Convert a WinRT IVectorView to a JS Array.
export function toArray<T = unknown>(o: { length: number; [index: number]: unknown } | T[]): T[] {
	const a = new Array(o.length);
	for (let i = 0; i < a.length; i++) {
		a[i] = o[i];
	}
	return a;
}

// Convert a WinRT IMap to a JS Map.
export interface Cursor {
	hasCurrent: boolean;
	moveNext(): void;
	current: {
		key: unknown;
		value: unknown;
	};
}
export function toMap(o: { first(): Cursor }): Map<unknown, unknown> {
	const m = new Map();
	for (let i = o.first(); i.hasCurrent; i.moveNext()) {
		m.set(i.current.key, i.current.value);
	}
	return m;
}

// Convert a WinRT IBuffer to a JS Buffer.
export function toBuffer(b: { length: number }): Buffer {
	// TODO: Use nodert-streams to more efficiently convert the buffer?
	const len = b.length;
	const DataReader = Windows.Storage.Streams.DataReader;
	const r = DataReader.fromBuffer(b);
	const a = new Uint8Array(len);
	for (let i = 0; i < len; i++) {
		a[i] = r.readByte();
	}
	return Buffer.from(a.buffer);
}

// Convert a JS Buffer to a WinRT IBuffer.
export function fromBuffer(b: Buffer): unknown {
	// TODO: Use nodert-streams to more efficiently convert the buffer?
	const len = b.length;
	const DataWriter = Windows.Storage.Streams.DataWriter;
	const w = new DataWriter();
	for (let i = 0; i < len; i++) {
		w.writeByte(b[i]);
	}
	return w.detachBuffer();
}

let keepAliveIntervalId: NodeJS.Timer = null;
let keepAliveIntervalCount = 0;

// Increment or decrement the count of WinRT async tasks.
// While the count is non-zero an interval is used to keep the JS engine alive.
export function keepAlive(k: boolean): void {
	if (k) {
		if (++keepAliveIntervalCount === 1) {
			// The actual duration doesn't really matter: it should be large but not too large.
			keepAliveIntervalId = setInterval(() => null, 24 * 60 * 60 * 1000);
		}
	} else {
		if (--keepAliveIntervalCount === 0) {
			clearInterval(keepAliveIntervalId);
		}
	}
}

export interface Disposable {
	close(): void;
}

const disposableMap: { [key: string]: Disposable[] } = {};

export function trackDisposable<T extends Disposable>(key: string, obj: T): T {
	if (!obj) {
		return obj;
	}

	if (typeof obj.close !== 'function') {
		throw new Error('Object does not have a close function.');
	}

	let disposableList = disposableMap[key];

	if (!disposableList) {
		disposableList = [];
		disposableMap[key] = disposableList;
	}

	for (let i = 0; i < disposableList.length; i++) {
		const disposable = disposableList[i];
		if (Object.is(obj, disposable)) {
			return obj;
		}
	}

	disposableList.push(obj);
	return obj;
}

export function trackDisposables<T extends Disposable>(key: string, array: T[]): T[] {
	array.forEach((obj) => trackDisposable(key, obj));
	return array;
}

export function disposeAll(key: string): void {
	const disposableList = disposableMap[key];

	if (!disposableList) {
		return;
	}

	for (let i = 0; i < disposableList.length; i++) {
		const disposable = disposableList[i];
		disposable.close();
	}
}
