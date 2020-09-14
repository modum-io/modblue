"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bindings_1 = __importDefault(require("./src/hci-socket/bindings"));
const Noble_1 = require("./src/Noble");
exports.default = new Noble_1.Noble(bindings_1.default);
//# sourceMappingURL=index.js.map