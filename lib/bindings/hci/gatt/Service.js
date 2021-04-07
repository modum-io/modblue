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
exports.HciGattService = void 0;
const models_1 = require("../../../models");
const GattLocal_1 = require("./GattLocal");
class HciGattService extends models_1.GattService {
    constructor(gatt, uuid, isRemote, startHandle, endHandle) {
        super(gatt, uuid, isRemote);
        this.characteristics = new Map();
        this.startHandle = startHandle;
        this.endHandle = endHandle;
    }
    discoverCharacteristics() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.gatt instanceof GattLocal_1.HciGattLocal) {
                return [...this.characteristics.values()];
            }
            else {
                const newChars = yield this.gatt.discoverCharacteristics(this.uuid);
                this.characteristics.clear();
                for (const char of newChars) {
                    this.characteristics.set(char.uuid, char);
                }
                return newChars;
            }
        });
    }
}
exports.HciGattService = HciGattService;
//# sourceMappingURL=Service.js.map