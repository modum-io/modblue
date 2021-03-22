import { GattDescriptor } from '../Descriptor';
export class GattDescriptorLocal extends GattDescriptor {
    constructor(characteristic, uuid, value) {
        super(characteristic, uuid);
        this.value = value;
    }
}
//# sourceMappingURL=Descriptor.js.map