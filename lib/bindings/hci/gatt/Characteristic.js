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
exports.HciGattCharacteristic = void 0;
const models_1 = require("../../../models");
const Descriptor_1 = require("./Descriptor");
const GattLocal_1 = require("./GattLocal");
class HciGattCharacteristic extends models_1.GattCharacteristic {
    constructor(service, uuid, isRemote, propsOrFlag, secureOrFlag, startHandle, valueHandle, readFuncOrValue, writeFunc) {
        super(service, uuid, isRemote, propsOrFlag, secureOrFlag, readFuncOrValue, writeFunc);
        this.descriptors = new Map();
        this.startHandle = startHandle;
        this.valueHandle = valueHandle;
    }
    get gatt() {
        return this.service.gatt;
    }
    addDescriptor(uuid, value) {
        return __awaiter(this, void 0, void 0, function* () {
            const desc = new Descriptor_1.HciGattDescriptor(this, uuid, false, 0, value);
            this.descriptors.set(desc.uuid, desc);
            return desc;
        });
    }
    discoverDescriptors() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.gatt instanceof GattLocal_1.HciGattLocal) {
                return [...this.descriptors.values()];
            }
            else {
                const newDescs = yield this.gatt.discoverDescriptors(this.service.uuid, this.uuid);
                this.descriptors.clear();
                for (const desc of newDescs) {
                    this.descriptors.set(desc.uuid, desc);
                }
                return newDescs;
            }
        });
    }
    read() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.gatt instanceof GattLocal_1.HciGattLocal) {
                return this.handleRead(0);
            }
            else {
                return this.gatt.readCharacteristic(this.service.uuid, this.uuid);
            }
        });
    }
    write(data, withoutResponse) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.gatt instanceof GattLocal_1.HciGattLocal) {
                yield this.handleWrite(0, data, withoutResponse);
            }
            else {
                yield this.gatt.writeCharacteristic(this.service.uuid, this.uuid, data, withoutResponse);
            }
        });
    }
    broadcast(broadcast) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.gatt instanceof GattLocal_1.HciGattLocal) {
                throw new Error('Not supported');
            }
            else {
                yield this.gatt.broadcastCharacteristic(this.service.uuid, this.uuid, broadcast);
            }
        });
    }
    notify(notify) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.gatt instanceof GattLocal_1.HciGattLocal) {
                throw new Error('Not supported');
            }
            else {
                yield this.gatt.notifyCharacteristic(this.service.uuid, this.uuid, notify);
            }
        });
    }
}
exports.HciGattCharacteristic = HciGattCharacteristic;
//# sourceMappingURL=Characteristic.js.map