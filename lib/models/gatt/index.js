"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GattService = exports.Gatt = exports.GattDescriptor = exports.GattCharacteristic = void 0;
var Characteristic_1 = require("./Characteristic");
Object.defineProperty(exports, "GattCharacteristic", { enumerable: true, get: function () { return Characteristic_1.GattCharacteristic; } });
var Descriptor_1 = require("./Descriptor");
Object.defineProperty(exports, "GattDescriptor", { enumerable: true, get: function () { return Descriptor_1.GattDescriptor; } });
var Gatt_1 = require("./Gatt");
Object.defineProperty(exports, "Gatt", { enumerable: true, get: function () { return Gatt_1.Gatt; } });
var Service_1 = require("./Service");
Object.defineProperty(exports, "GattService", { enumerable: true, get: function () { return Service_1.GattService; } });
__exportStar(require("./local"), exports);
__exportStar(require("./remote"), exports);
//# sourceMappingURL=index.js.map