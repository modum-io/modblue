import { Adapter } from '../Adapter';
import { Gatt } from './Gatt';
import { GattService } from './Service';
/**
 * A local GATT server.
 */
export declare abstract class GattLocal extends Gatt {
    /**
     * The adapter that this GATT server belongs to.
     */
    readonly adapter: Adapter;
    get isRemote(): boolean;
    constructor(adapter: Adapter, mtu?: number, services?: GattService[]);
    /**
     * Adds a new service to this GATT server.
     */
    abstract addService(uuid: string): Promise<GattService>;
    /**
     * Prepares this GATT server for advertisement.
     * @param deviceName The name of this device as specified in the general service / characteristic.
     */
    abstract prepare(deviceName: string): Promise<void>;
    toString(): string;
    toJSON(): Record<string, unknown>;
}
//# sourceMappingURL=GattLocal.d.ts.map