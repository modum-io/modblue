import { GattCharacteristic } from '../../../models';
export class DbusGattCharacteristic extends GattCharacteristic {
    constructor(service, uuid, isRemote, properties, secure, path) {
        super(service, uuid, isRemote, properties, secure);
        this.path = path;
    }
}
//# sourceMappingURL=Characteristic.js.map