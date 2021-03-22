import { GattService } from '../Service';
export class GattServiceLocal extends GattService {
    constructor(gatt, uuid, characteristics) {
        super(gatt, uuid);
        this.characteristics = characteristics;
    }
}
//# sourceMappingURL=Service.js.map