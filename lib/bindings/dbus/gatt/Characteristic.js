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
exports.DbusGattCharacteristic = void 0;
const models_1 = require("../../../models");
const misc_1 = require("../misc");
class DbusGattCharacteristic extends models_1.GattCharacteristic {
    constructor(service, uuid, isRemote, properties, secure, path) {
        super(service, uuid, isRemote, properties, secure);
        this.path = path;
    }
    get dbus() {
        return this.service.gatt.peripheral.adapter.modblue.dbus;
    }
    discoverDescriptors() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Method not implemented.');
        });
    }
    read() {
        return __awaiter(this, void 0, void 0, function* () {
            const iface = yield this.getInterface();
            return iface.ReadValue({
                offset: misc_1.buildTypedValue('uint16', 0)
            });
        });
    }
    write(data, withoutResponse) {
        return __awaiter(this, void 0, void 0, function* () {
            const iface = yield this.getInterface();
            yield iface.WriteValue([...data], {
                offset: misc_1.buildTypedValue('uint16', 0),
                type: misc_1.buildTypedValue('string', withoutResponse ? 'command' : 'request')
            });
        });
    }
    broadcast() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Method not implemented.');
        });
    }
    notify() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Method not implemented.');
        });
    }
    getInterface() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.iface) {
                const obj = yield this.dbus.getProxyObject('org.bluez', this.path);
                this.iface = obj.getInterface(misc_1.I_BLUEZ_CHARACTERISTIC);
            }
            return this.iface;
        });
    }
    addDescriptor() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Method not implemented.');
        });
    }
}
exports.DbusGattCharacteristic = DbusGattCharacteristic;
//# sourceMappingURL=Characteristic.js.map