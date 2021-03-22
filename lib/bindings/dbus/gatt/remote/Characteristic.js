import { GattCharacteristicRemote } from '../../../../models';
export class DbusGattCharacteristicRemote extends GattCharacteristicRemote {
    constructor(service, path, uuid, properties, secure) {
        super(service, uuid, properties, secure);
        this.path = path;
    }
}
//# sourceMappingURL=Characteristic.js.map