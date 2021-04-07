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
exports.WebGattCharacteristic = void 0;
const models_1 = require("../../../models");
const Descriptor_1 = require("./Descriptor");
class WebGattCharacteristic extends models_1.GattCharacteristic {
    constructor(service, characteristic, properties, secure) {
        super(service, characteristic.uuid, true, properties, secure);
        this.descriptors = new Map();
        this.onValueChanged = (event) => {
            this.emit('notification', event.target.value.buffer);
        };
        this.char = characteristic;
    }
    discoverDescriptors() {
        return __awaiter(this, void 0, void 0, function* () {
            const newDescs = yield this.char.getDescriptors();
            this.descriptors.clear();
            for (const desc of newDescs) {
                this.descriptors.set(desc.uuid, new Descriptor_1.WebGattDescriptor(this, desc));
            }
            return [...this.descriptors.values()];
        });
    }
    read() {
        return __awaiter(this, void 0, void 0, function* () {
            const view = yield this.char.readValue();
            return view.buffer;
        });
    }
    write(data, withoutResponse) {
        return __awaiter(this, void 0, void 0, function* () {
            if (withoutResponse) {
                yield this.char.writeValueWithoutResponse(data);
            }
            else {
                yield this.char.writeValueWithResponse(data);
            }
        });
    }
    broadcast() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Method not implemented.');
        });
    }
    notify(notify) {
        return __awaiter(this, void 0, void 0, function* () {
            if (notify) {
                yield this.char.startNotifications();
                this.char.addEventListener('characteristicvaluechanged', this.onValueChanged);
            }
            else {
                yield this.char.stopNotifications();
                this.char.removeEventListener('characteristicvaluechanged', this.onValueChanged);
            }
        });
    }
}
exports.WebGattCharacteristic = WebGattCharacteristic;
//# sourceMappingURL=Characteristic.js.map