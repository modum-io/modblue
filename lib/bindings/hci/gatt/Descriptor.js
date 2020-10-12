"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HciDescriptor = void 0;
const models_1 = require("../../../models");
class HciDescriptor extends models_1.GattDescriptorRemote {
    constructor(characteristic, uuid, handle) {
        super(characteristic, uuid);
        this.handle = handle;
    }
}
exports.HciDescriptor = HciDescriptor;
//# sourceMappingURL=Descriptor.js.map