"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HciCharacteristic = void 0;
const models_1 = require("../../../models");
class HciCharacteristic extends models_1.GattCharacteristicRemote {
    constructor(service, uuid, properties, startHandle, valueHandle) {
        super(service, uuid, properties);
        this.descriptors = new Map();
        this.startHandle = startHandle;
        this.valueHandle = valueHandle;
    }
}
exports.HciCharacteristic = HciCharacteristic;
//# sourceMappingURL=Characteristic.js.map