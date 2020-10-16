"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HciGattServiceRemote = exports.HciGattRemote = exports.HciGattDescriptorRemote = exports.HciGattCharacteristicRemote = exports.HciGattLocal = void 0;
__exportStar(require("./Constants"), exports);
var local_1 = require("./local");
Object.defineProperty(exports, "HciGattLocal", { enumerable: true, get: function () { return local_1.HciGattLocal; } });
var remote_1 = require("./remote");
Object.defineProperty(exports, "HciGattCharacteristicRemote", { enumerable: true, get: function () { return remote_1.HciGattCharacteristicRemote; } });
Object.defineProperty(exports, "HciGattDescriptorRemote", { enumerable: true, get: function () { return remote_1.HciGattDescriptorRemote; } });
Object.defineProperty(exports, "HciGattRemote", { enumerable: true, get: function () { return remote_1.HciGattRemote; } });
Object.defineProperty(exports, "HciGattServiceRemote", { enumerable: true, get: function () { return remote_1.HciGattServiceRemote; } });
//# sourceMappingURL=index.js.map