import { GattCharacteristic } from '../../../models';
export class HciGattCharacteristic extends GattCharacteristic {
    constructor(service, uuid, isRemote, propertiesFlag, secureFlag, startHandle, valueHandle) {
        super(service, uuid, isRemote, propertiesFlag, secureFlag);
        this.descriptors = new Map();
        this.startHandle = startHandle;
        this.valueHandle = valueHandle;
    }
}
//# sourceMappingURL=Characteristic.js.map