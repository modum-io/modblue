"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HCI = exports.BaseService = exports.BasePeripheral = exports.BaseNoble = exports.BaseDescriptor = exports.BaseCharacteristic = exports.BaseAdapter = void 0;
var Adapter_1 = require("./Adapter");
Object.defineProperty(exports, "BaseAdapter", { enumerable: true, get: function () { return Adapter_1.BaseAdapter; } });
var Characteristic_1 = require("./Characteristic");
Object.defineProperty(exports, "BaseCharacteristic", { enumerable: true, get: function () { return Characteristic_1.BaseCharacteristic; } });
var Descriptor_1 = require("./Descriptor");
Object.defineProperty(exports, "BaseDescriptor", { enumerable: true, get: function () { return Descriptor_1.BaseDescriptor; } });
var Noble_1 = require("./Noble");
Object.defineProperty(exports, "BaseNoble", { enumerable: true, get: function () { return Noble_1.BaseNoble; } });
var Peripheral_1 = require("./Peripheral");
Object.defineProperty(exports, "BasePeripheral", { enumerable: true, get: function () { return Peripheral_1.BasePeripheral; } });
var Service_1 = require("./Service");
Object.defineProperty(exports, "BaseService", { enumerable: true, get: function () { return Service_1.BaseService; } });
exports.HCI = __importStar(require("./bindings/hci-socket"));
//# sourceMappingURL=index.js.map