import { GattCharacteristic } from '../Characteristic';
export class GattCharacteristicLocal extends GattCharacteristic {
    constructor(service, uuid, properties, secure, readFunc, writeFunc, descriptors) {
        super(service, uuid, properties, secure);
        this.descriptors = descriptors;
        this.readFunc = readFunc;
        this.writeFunc = writeFunc;
    }
    async readRequest(offset) {
        return this.readFunc(offset);
    }
    async writeRequest(offset, data, withoutResponse) {
        return this.writeFunc(offset, data, withoutResponse);
    }
}
//# sourceMappingURL=Characteristic.js.map