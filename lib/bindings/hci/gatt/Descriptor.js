"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HciGattDescriptor = void 0;
const models_1 = require("../../../models");
class HciGattDescriptor extends models_1.GattDescriptor {
    constructor(characteristic, uuid, isRemote, handle) {
        super(characteristic, uuid, isRemote);
        this.handle = handle;
    }
}
exports.HciGattDescriptor = HciGattDescriptor;
//# sourceMappingURL=Descriptor.js.map