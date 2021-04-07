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
exports.HciGattDescriptor = void 0;
const models_1 = require("../../../models");
const GattLocal_1 = require("./GattLocal");
class HciGattDescriptor extends models_1.GattDescriptor {
    constructor(characteristic, uuid, isRemote, handle, value) {
        super(characteristic, uuid, isRemote, value);
        this.handle = handle;
    }
    get service() {
        return this.characteristic.service;
    }
    get gatt() {
        return this.service.gatt;
    }
    read() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.gatt instanceof GattLocal_1.HciGattLocal) {
                return this.handleRead(0);
            }
            else {
                return this.gatt.readDescriptor(this.service.uuid, this.characteristic.uuid, this.uuid);
            }
        });
    }
    write(data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.gatt instanceof GattLocal_1.HciGattLocal) {
                yield this.handleWrite(0, data);
            }
            else {
                yield this.gatt.writeDescriptor(this.service.uuid, this.characteristic.uuid, this.uuid, data);
            }
        });
    }
}
exports.HciGattDescriptor = HciGattDescriptor;
//# sourceMappingURL=Descriptor.js.map