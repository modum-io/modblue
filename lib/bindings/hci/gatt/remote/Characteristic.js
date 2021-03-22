import { GattCharacteristicRemote } from '../../../../models';
export class HciGattCharacteristicRemote extends GattCharacteristicRemote {
    constructor(service, uuid, propertiesFlag, secureFlag, startHandle, valueHandle) {
        super(service, uuid, propertiesFlag, secureFlag);
        this.descriptors = new Map();
        this.startHandle = startHandle;
        this.valueHandle = valueHandle;
    }
}
//# sourceMappingURL=Characteristic.js.map