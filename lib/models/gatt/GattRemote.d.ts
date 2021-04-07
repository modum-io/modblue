import { Peripheral } from '../Peripheral';
import { Gatt } from './Gatt';
import { GattService } from './Service';
/**
 * A remote GATT server.
 */
export declare abstract class GattRemote extends Gatt {
    /**
     * The peripheral that this GATT server belongs to.
     */
    readonly peripheral: Peripheral;
    get isRemote(): boolean;
    constructor(peripheral: Peripheral, mtu?: number);
    /**
     * Discover all services of this GATT server.
     */
    abstract discoverServices(): Promise<GattService[]>;
    toJSON(): Record<string, unknown>;
}
//# sourceMappingURL=GattRemote.d.ts.map