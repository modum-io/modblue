"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = __importDefault(require("events"));
const util_1 = __importDefault(require("util"));
// eslint-disable-next-line @typescript-eslint/no-var-requires
const NobleMac = require('./native/binding').NobleMac;
util_1.default.inherits(NobleMac, events_1.default.EventEmitter);
module.exports = NobleMac;
//# sourceMappingURL=bindings.js.map