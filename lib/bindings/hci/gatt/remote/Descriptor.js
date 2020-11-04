"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HciGattDescriptorRemote = void 0;
const models_1 = require("../../../../models");
class HciGattDescriptorRemote extends models_1.GattDescriptorRemote {
    constructor(characteristic, uuid, handle) {
        super(characteristic, uuid);
        this.handle = handle;
    }
}
exports.HciGattDescriptorRemote = HciGattDescriptorRemote;
//# sourceMappingURL=Descriptor.js.map