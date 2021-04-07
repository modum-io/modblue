import { GattService } from './Service';
/**
 * A local or remote GATT server.
 */
export declare abstract class Gatt {
    /**
     * True if this is a remote GATT server, false otherwise.
     */
    abstract get isRemote(): boolean;
    /**
     * The services that belong to this GATT server, mapped by UUID.
     * If this is a remote GATT use {@link discoverServices} to discover them.
     */
    readonly services: Map<string, GattService>;
    protected _mtu: number;
    /**
     * Local: The maximum MTU that will be agreed upon during negotiation.
     * Remote: The MTU that was agreed upon during negotiation.
     */
    get mtu(): number;
    constructor(mtu?: number, services?: GattService[]);
    toString(): string;
    toJSON(): Record<string, unknown>;
}
//# sourceMappingURL=Gatt.d.ts.map