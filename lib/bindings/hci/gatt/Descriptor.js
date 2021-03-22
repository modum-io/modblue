import { GattDescriptor } from '../../../models';
export class HciGattDescriptor extends GattDescriptor {
    constructor(characteristic, uuid, isRemote, handle) {
        super(characteristic, uuid, isRemote);
        this.handle = handle;
    }
}
//# sourceMappingURL=Descriptor.js.map