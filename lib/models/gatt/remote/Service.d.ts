import { GattService } from '../Service';
import { GattCharacteristicRemote } from './Characteristic';
import { GattRemote } from './Gatt';
/**
 * Represents a GATT service of a remote GATT server.
 */
export declare class GattServiceRemote extends GattService {
    /**
     * The remote GATT server that this service belongs to.
     */
    readonly gatt: GattRemote;
    /**
     * A map of UUID to characteristic that were discovered during {@link discoverCharacteristics}.
     */
    readonly characteristics: Map<string, GattCharacteristicRemote>;
    /**
     * Discover all charactersitics of this service.
     */
    discoverCharacteristics(): Promise<GattCharacteristicRemote[]>;
}
//# sourceMappingURL=Service.d.ts.map