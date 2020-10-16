"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HciGattCharacteristicRemote = void 0;
const models_1 = require("../../../../models");
class HciGattCharacteristicRemote extends models_1.GattCharacteristicRemote {
    constructor(service, uuid, propertiesFlag, secureFlag, startHandle, valueHandle) {
        super(service, uuid, propertiesFlag, secureFlag);
        this.descriptors = new Map();
        this.startHandle = startHandle;
        this.valueHandle = valueHandle;
    }
}
exports.HciGattCharacteristicRemote = HciGattCharacteristicRemote;
//# sourceMappingURL=Characteristic.js.map