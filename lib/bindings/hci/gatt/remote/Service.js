import { GattServiceRemote } from '../../../../models';
export class HciGattServiceRemote extends GattServiceRemote {
    constructor(gatt, uuid, startHandle, endHandle) {
        super(gatt, uuid);
        this.characteristics = new Map();
        this.startHandle = startHandle;
        this.endHandle = endHandle;
    }
}
//# sourceMappingURL=Service.js.map