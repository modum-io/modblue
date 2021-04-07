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
exports.WebGatt = void 0;
const models_1 = require("../../../models");
const Service_1 = require("./Service");
class WebGatt extends models_1.GattRemote {
    constructor(peripheral, gatt) {
        super(peripheral);
        this.services = new Map();
        this.gatt = gatt;
    }
    discoverServices() {
        return __awaiter(this, void 0, void 0, function* () {
            const newServices = yield this.gatt.getPrimaryServices();
            this.services.clear();
            for (const service of newServices) {
                this.services.set(service.uuid, new Service_1.WebGattService(this, service));
            }
            return [...this.services.values()];
        });
    }
    addService() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Method not implemented.');
        });
    }
    prepare() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Method not implemented.');
        });
    }
    disconnect() {
        this.gatt.disconnect();
    }
}
exports.WebGatt = WebGatt;
//# sourceMappingURL=Gatt.js.map