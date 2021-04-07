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
exports.WebGattService = void 0;
const models_1 = require("../../../models");
const Characteristic_1 = require("./Characteristic");
class WebGattService extends models_1.GattService {
    constructor(gatt, service) {
        super(gatt, service.uuid, true);
        this.characteristics = new Map();
        this.srv = service;
    }
    discoverCharacteristics() {
        return __awaiter(this, void 0, void 0, function* () {
            const newChars = yield this.srv.getCharacteristics();
            this.characteristics.clear();
            for (const char of newChars) {
                const props = [];
                if (char.properties.read) {
                    props.push('read');
                }
                if (char.properties.write) {
                    props.push('write');
                }
                if (char.properties.writeWithoutResponse) {
                    props.push('write-without-response');
                }
                if (char.properties.broadcast) {
                    props.push('broadcast');
                }
                if (char.properties.notify) {
                    props.push('notify');
                }
                if (char.properties.indicate) {
                    props.push('indicate');
                }
                if (char.properties.reliableWrite) {
                    props.push('reliable-write');
                }
                if (char.properties.writableAuxiliaries) {
                    props.push('writable-auxiliaries');
                }
                if (char.properties.authenticatedSignedWrites) {
                    props.push('authenticated-signed-writes');
                }
                this.characteristics.set(char.uuid, new Characteristic_1.WebGattCharacteristic(this, char, props, []));
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
exports.WebGattService = WebGattService;
//# sourceMappingURL=Service.js.map