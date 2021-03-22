import { GattService } from '../../../models';
export class HciGattService extends GattService {
    constructor(gatt, uuid, isRemote, startHandle, endHandle) {
        super(gatt, uuid, isRemote);
        this.characteristics = new Map();
        this.startHandle = startHandle;
        this.endHandle = endHandle;
    }
}
//# sourceMappingURL=Service.js.map