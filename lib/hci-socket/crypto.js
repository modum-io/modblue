"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reverse = exports.xor = exports.e = exports.s1 = exports.c1 = exports.r = void 0;
const crypto_1 = __importDefault(require("crypto"));
function r() {
    return crypto_1.default.randomBytes(16);
}
exports.r = r;
function c1(k, rBuff, pres, preq, iat, ia, rat, ra) {
    const p1 = Buffer.concat([iat, rat, preq, pres]);
    const p2 = Buffer.concat([ra, ia, Buffer.from('00000000', 'hex')]);
    let res = xor(rBuff, p1);
    res = e(k, res);
    res = xor(res, p2);
    res = e(k, res);
    return res;
}
exports.c1 = c1;
function s1(k, r1, r2) {
    return e(k, Buffer.concat([r2.slice(0, 8), r1.slice(0, 8)]));
}
exports.s1 = s1;
function e(key, data) {
    key = reverse(key);
    data = reverse(data);
    const cipher = crypto_1.default.createCipheriv('aes-128-ecb', key, '');
    cipher.setAutoPadding(false);
    return reverse(Buffer.concat([cipher.update(data), cipher.final()]));
}
exports.e = e;
function xor(b1, b2) {
    const result = Buffer.alloc(b1.length);
    for (let i = 0; i < b1.length; i++) {
        // tslint:disable-next-line: no-bitwise
        result[i] = b1[i] ^ b2[i];
    }
    return result;
}
exports.xor = xor;
function reverse(input) {
    const output = Buffer.alloc(input.length);
    for (let i = 0; i < output.length; i++) {
        output[i] = input[input.length - i - 1];
    }
    return output;
}
exports.reverse = reverse;
//# sourceMappingURL=crypto.js.map