/// <reference types="node" />
import { inspect, InspectOptionsStylized } from 'util';
/**
 * A local or remote GATT server.
 */
export declare abstract class Gatt {
    toString(): string;
    toJSON(): {};
    [inspect.custom](depth: number, options: InspectOptionsStylized): string;
}
//# sourceMappingURL=Gatt.d.ts.map