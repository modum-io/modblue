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
exports.WebGattDescriptor = void 0;
const models_1 = require("../../../models");
class WebGattDescriptor extends models_1.GattDescriptor {
    constructor(characteristic, descriptor) {
        super(characteristic, descriptor.uuid, true);
        this.desc = descriptor;
    }
    read() {
        return __awaiter(this, void 0, void 0, function* () {
            const view = yield this.desc.readValue();
            return view.buffer;
        });
    }
    write(data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.desc.writeValue(data);
        });
    }
}
exports.WebGattDescriptor = WebGattDescriptor;
//# sourceMappingURL=Descriptor.js.map