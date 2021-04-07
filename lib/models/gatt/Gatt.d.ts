import { Adapter } from '../Adapter';
import { Peripheral } from '../Peripheral';
import { GattService } from './Service';
/**
 * A local or remote GATT server.
 */
export declare abstract class Gatt {
    /**
     * Local: undefined
     * Remote: The peripheral that this GATT server belongs to.
     */
    readonly peripheral: Peripheral;
    /**
     * Local: The adapter that this GATT server belongs to.
     * Remote: undefined
     */
    readonly adapter: Adapter;
    /**
     * True if this is a remote GATT server, false otherwise.
     */
    get isRemote(): boolean;
    /**
     * The services that belong to this GATT server, mapped by UUID.
     * If this is a remote GATT use {@link discoverServices} to discover them.
     */
    readonly services: Map<string, GattService>;
    protected _mtu: number;
    /**
     * Local: The maximum MTU that will agreed upon during negotiation.
     * Remote: The MTU that was agreed upon during negotiation.
     */
    get mtu(): number;
    constructor(peripheral?: Peripheral, adapter?: Adapter, mtu?: number, services?: GattService[]);
    /**
     * Local only: Adds a new service to this GATT server.
     */
    abstract addService(uuid: string): Promise<GattService>;
    /**
     * Local only: Prepares this GATT server for advertisement.
     * This assumes that no further changes to the services or characteristics will happen.
     * @param deviceName The name of this device. Also used in the advertisement.
     */
    abstract prepare(deviceName: string): Promise<void>;
    /**
     * Remote only: Discover all services of this GATT server.
     */
    abstract discoverServices(): Promise<GattService[]>;
    toString(): string;
    toJSON(): Record<string, unknown>;
}
//# sourceMappingURL=Gatt.d.ts.map