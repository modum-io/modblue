import { GattServiceRemote } from '../../../../models';
export class DbusGattServiceRemote extends GattServiceRemote {
    constructor(gatt, path, uuid) {
        super(gatt, uuid);
        this.characteristics = new Map();
        this.path = path;
    }
}
//# sourceMappingURL=Service.js.map