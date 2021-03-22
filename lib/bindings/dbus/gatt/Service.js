import { GattService } from '../../../models';
export class DbusGattService extends GattService {
    constructor(gatt, uuid, isRemote, path) {
        super(gatt, uuid, isRemote);
        this.characteristics = new Map();
        this.path = path;
    }
}
//# sourceMappingURL=Service.js.map