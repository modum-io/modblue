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
exports.DbusGattService = void 0;
const models_1 = require("../../../models");
const misc_1 = require("../misc");
const Characteristic_1 = require("./Characteristic");
class DbusGattService extends models_1.GattService {
    constructor(gatt, uuid, isRemote, path) {
        super(gatt, uuid, isRemote);
        this.characteristics = new Map();
        this.path = path;
    }
    get dbus() {
        return this.gatt.peripheral.adapter.modblue.dbus;
    }
    discoverCharacteristics() {
        return __awaiter(this, void 0, void 0, function* () {
            const objManager = yield this.dbus.getProxyObject(`org.bluez`, '/');
            const objManagerIface = objManager.getInterface(misc_1.I_OBJECT_MANAGER);
            const objs = yield objManagerIface.GetManagedObjects();
            const keys = Object.keys(objs);
            this.characteristics.clear();
            for (const charPath of keys) {
                if (!charPath.startsWith(this.path)) {
                    continue;
                }
                const charObj = objs[charPath][misc_1.I_BLUEZ_CHARACTERISTIC];
                if (!charObj) {
                    continue;
                }
                const uuid = charObj.UUID.value.replace(/-/g, '');
                const properties = charObj.Flags.value.filter((p) => !p.startsWith('secure-'));
                const secure = properties.filter((p) => p.startsWith('encrypt')).map((p) => p.replace('encrypt-', ''));
                const characteristic = new Characteristic_1.DbusGattCharacteristic(this, uuid, true, properties, secure, charPath);
                this.characteristics.set(characteristic.uuid, characteristic);
            }
            return [...this.characteristics.values()];
        });
    }
    addCharacteristic() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Method not implemented.');
        });
    }
}
exports.DbusGattService = DbusGattService;
//# sourceMappingURL=Service.js.map