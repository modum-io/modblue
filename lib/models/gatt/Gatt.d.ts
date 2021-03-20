/// <reference types="node" />
import { inspect } from 'util';
/**
 * A local or remote GATT server.
 */
export declare abstract class Gatt {
    toString(): string;
    toJSON(): Record<string, unknown>;
    [inspect.custom](depth: number, options: any): string;
}
//# sourceMappingURL=Gatt.d.ts.map