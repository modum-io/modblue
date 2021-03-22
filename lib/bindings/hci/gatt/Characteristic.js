"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HciGattCharacteristic = void 0;
const models_1 = require("../../../models");
class HciGattCharacteristic extends models_1.GattCharacteristic {
    constructor(service, uuid, isRemote, propertiesFlag, secureFlag, startHandle, valueHandle) {
        super(service, uuid, isRemote, propertiesFlag, secureFlag);
        this.descriptors = new Map();
        this.startHandle = startHandle;
        this.valueHandle = valueHandle;
    }
}
exports.HciGattCharacteristic = HciGattCharacteristic;
//# sourceMappingURL=Characteristic.js.map