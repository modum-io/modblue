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
exports.DbusPeripheral = void 0;
const models_1 = require("../../models");
const gatt_1 = require("./gatt");
const misc_1 = require("./misc");
const CONNECT_TIMEOUT = 10; // in seconds
class DbusPeripheral extends models_1.Peripheral {
    constructor(adapter, path, id, addressType, address, advertisement, rssi) {
        super(adapter, id, addressType, address, advertisement, rssi);
        this._init = false;
        this.isConnecting = false;
        this.connecting = [];
        this.isDisconnecting = false;
        this.disconnecting = [];
        this.path = path;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._init) {
                return;
            }
            const obj = yield this.adapter.modblue.dbus.getProxyObject('org.bluez', this.path);
            this.propsIface = obj.getInterface(misc_1.I_PROPERTIES);
            this.deviceIface = obj.getInterface(misc_1.I_BLUEZ_DEVICE);
            this._init = true;
        });
    }
    prop(iface, name) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.init();
            const rawProp = yield this.propsIface.Get(iface, name);
            return rawProp.value;
        });
    }
    isConnected() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prop(misc_1.I_BLUEZ_DEVICE, 'Connected');
        });
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield this.isConnected()) {
                return;
            }
            if (this.isDisconnecting) {
                throw new Error(`Device is currently disconnecting, cannot connect`);
            }
            if (this.isConnecting) {
                return new Promise((resolve, reject) => this.connecting.push([resolve, reject]));
            }
            this.connecting = [];
            this.isConnecting = true;
            yield this.init();
            return new Promise((resolve, reject) => {
                this.connecting.push([resolve, reject]);
                const done = () => this.doneConnecting();
                const onPropertiesChanged = (iface, changedProps) => {
                    if (iface !== misc_1.I_BLUEZ_DEVICE) {
                        return;
                    }
                    if ('Connected' in changedProps && changedProps.Connected.value) {
                        this.propsIface.off('PropertiesChanged', onPropertiesChanged);
                        done();
                    }
                };
                this.propsIface.on('PropertiesChanged', onPropertiesChanged);
                const timeout = () => __awaiter(this, void 0, void 0, function* () {
                    this.doneConnecting(new Error('Connecting timed out'));
                    this.propsIface.off('PropertiesChanged', onPropertiesChanged);
                    try {
                        // Disconnect can be used to cancel pending connects
                        yield this.deviceIface.Disconnect();
                    }
                    catch (_a) {
                        // NO-OP
                    }
                });
                this.connectTimeout = setTimeout(timeout, CONNECT_TIMEOUT * 1000);
                this.deviceIface.Connect().catch((err) => this.doneConnecting(err));
            });
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield this.isConnected())) {
                return;
            }
            if (this.isConnecting) {
                throw new Error(`Device is currently connecting, cannot disconnect`);
            }
            if (this.isDisconnecting) {
                return new Promise((resolve, reject) => this.disconnecting.push([resolve, reject]));
            }
            this.disconnecting = [];
            this.isDisconnecting = true;
            yield this.init();
            return new Promise((resolve, reject) => {
                this.disconnecting.push([resolve, reject]);
                const done = () => this.doneDisconnecting();
                const onPropertiesChanged = (iface, changedProps) => {
                    if (iface !== misc_1.I_BLUEZ_DEVICE) {
                        return;
                    }
                    if ('Connected' in changedProps && !changedProps.Connected.value) {
                        this.propsIface.off('PropertiesChanged', onPropertiesChanged);
                        done();
                    }
                };
                this.propsIface.on('PropertiesChanged', onPropertiesChanged);
                const timeout = () => {
                    this.doneDisconnecting(new Error('Disconnecting timed out'));
                    this.propsIface.off('PropertiesChanged', onPropertiesChanged);
                };
                this.disconnectTimeout = setTimeout(timeout, CONNECT_TIMEOUT * 1000);
                this.deviceIface.Disconnect().catch((err) => this.doneDisconnecting(err));
            });
        });
    }
    doneConnecting(error) {
        if (!this.isConnecting) {
            return;
        }
        this.isConnecting = false;
        clearTimeout(this.connectTimeout);
        if (error) {
            this.connecting.forEach(([, rej]) => rej(error));
        }
        else {
            this.connecting.forEach(([res]) => res());
        }
        this.connecting = [];
    }
    doneDisconnecting(error) {
        if (!this.isDisconnecting) {
            return;
        }
        this.isDisconnecting = false;
        clearTimeout(this.disconnectTimeout);
        if (error) {
            this.disconnecting.forEach(([, rej]) => rej(error));
        }
        else {
            this.disconnecting.forEach(([res]) => res());
        }
        this.disconnecting = [];
    }
    setupGatt(requestMtu) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.gatt) {
                return this.gatt;
            }
            if (requestMtu) {
                throw new Error(`MTU requests are not accepted for dbus`);
            }
            this.gatt = new gatt_1.DbusGattRemote(this);
            return this.gatt;
        });
    }
}
exports.DbusPeripheral = DbusPeripheral;
//# sourceMappingURL=Peripheral.js.map