/// <reference types="node" />
export declare function using(packageName: string, ns: string): void;
export declare function promisify(fn: () => void, o?: unknown): (...args: unknown[]) => Promise<unknown>;
export declare function toArray<T = unknown>(o: {
    length: number;
    [index: number]: unknown;
} | T[]): T[];
export interface Cursor {
    hasCurrent: boolean;
    moveNext(): void;
    current: {
        key: unknown;
        value: unknown;
    };
}
export declare function toMap(o: {
    first(): Cursor;
}): Map<unknown, unknown>;
export declare function toBuffer(b: {
    length: number;
}): Buffer;
export declare function fromBuffer(b: Buffer): unknown;
export declare function keepAlive(alive: boolean): void;
export interface Disposable {
    close(): void;
}
export declare function trackDisposable<T extends Disposable>(key: string, obj: T): T;
export declare function trackDisposables<T extends Disposable>(key: string, array: T[]): T[];
export declare function disposeAll(key: string): void;
//# sourceMappingURL=rt-utils.d.ts.map