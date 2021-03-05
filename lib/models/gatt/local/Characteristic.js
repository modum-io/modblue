"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GattCharacteristicLocal = void 0;
const Characteristic_1 = require("../Characteristic");
class GattCharacteristicLocal extends Characteristic_1.GattCharacteristic {
    constructor(service, uuid, properties, secure, readFunc, writeFunc, descriptors) {
        super(service, uuid, properties, secure);
        this.descriptors = descriptors;
        this.readFunc = readFunc;
        this.writeFunc = writeFunc;
    }
    readRequest(offset) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.readFunc(offset);
        });
    }
    writeRequest(offset, data, withoutResponse) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.writeFunc(offset, data, withoutResponse);
        });
    }
}
exports.GattCharacteristicLocal = GattCharacteristicLocal;
//# sourceMappingURL=Characteristic.js.map