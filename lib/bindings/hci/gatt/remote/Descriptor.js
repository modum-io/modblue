import { GattDescriptorRemote } from '../../../../models';
export class HciGattDescriptorRemote extends GattDescriptorRemote {
    constructor(characteristic, uuid, handle) {
        super(characteristic, uuid);
        this.handle = handle;
    }
}
//# sourceMappingURL=Descriptor.js.map