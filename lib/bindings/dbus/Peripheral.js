"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbusPeripheral = void 0;
const models_1 = require("../../models");
const gatt_1 = require("./gatt");
const misc_1 = require("./misc");
// tslint:disable: promise-must-complete
const CONNECT_TIMEOUT = 10; // in seconds
class DbusPeripheral extends models_1.Peripheral {
    constructor(adapter, id, address, addressType, busObject) {
        super(adapter, id, address, addressType);
        this.services = new Map();
        this.isConnecting = false;
        this.connecting = [];
        this.isDisconnecting = false;
        this.disconnecting = [];
        this.busObject = busObject;
    }
    prop(propName) {
        return this.busObject.prop(misc_1.I_BLUEZ_DEVICE, propName);
    }
    callMethod(methodName, ...args) {
        return this.busObject.callMethod(misc_1.I_BLUEZ_DEVICE, methodName, ...args);
    }
    async isConnected() {
        return this.prop('Connected');
    }
    async connect(requestMtu) {
        if (await this.isConnected()) {
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
        return new Promise(async (resolve, reject) => {
            this.connecting.push([resolve, reject]);
            const done = () => this.doneConnecting();
            const propertiesIface = await this.busObject.getPropertiesInterface();
            const onPropertiesChanged = (iface, changedProps) => {
                if (iface !== misc_1.I_BLUEZ_DEVICE) {
                    return;
                }
                if ('Connected' in changedProps && changedProps.Connected.value) {
                    propertiesIface.off('PropertiesChanged', onPropertiesChanged);
                    done();
                }
            };
            propertiesIface.on('PropertiesChanged', onPropertiesChanged);
            const timeout = async () => {
                this.doneConnecting('Connecting timed out');
                propertiesIface.off('PropertiesChanged', onPropertiesChanged);
                try {
                    // Disconnect can be used to cancel pending connects
                    await this.callMethod('Disconnect');
                }
                catch (_a) {
                    // NO-OP
                }
            };
            this.connectTimeout = setTimeout(timeout, CONNECT_TIMEOUT * 1000);
            try {
                await this.callMethod('Connect');
            }
            catch (err) {
                this.doneConnecting(err);
            }
        });
    }
    async disconnect() {
        if (!(await this.isConnected())) {
            return;
        }
        if (this.isConnecting) {
            throw new Error(`Device is currently connecting, cannot disconnect`);
        }
        if (this.isDisconnecting) {
            return new Promise((resolve, reject) => this.disconnecting.push([resolve, reject]));
        }
        // Currently disabled the cache after disconnect because it seems to throw errors
        // this.gattServer = null;
        this.disconnecting = [];
        this.isDisconnecting = true;
        return new Promise(async (resolve, reject) => {
            this.disconnecting.push([resolve, reject]);
            const done = () => this.doneDisconnecting();
            const propertiesIface = await this.busObject.getPropertiesInterface();
            const onPropertiesChanged = (iface, changedProps) => {
                if (iface !== misc_1.I_BLUEZ_DEVICE) {
                    return;
                }
                if ('Connected' in changedProps && !changedProps.Connected.value) {
                    propertiesIface.off('PropertiesChanged', onPropertiesChanged);
                    done();
                }
            };
            propertiesIface.on('PropertiesChanged', onPropertiesChanged);
            const timeout = () => {
                this.doneDisconnecting('Disconnecting timed out');
                propertiesIface.off('PropertiesChanged', onPropertiesChanged);
            };
            this.disconnectTimeout = setTimeout(timeout, CONNECT_TIMEOUT * 1000);
            try {
                await this.callMethod('Disconnect');
            }
            catch (err) {
                this.doneDisconnecting(err);
            }
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
    async setupGatt(requestMtu) {
        if (this.gatt) {
            return this.gatt;
        }
        if (requestMtu) {
            throw new Error(`MTU requests are not accepted for dbus`);
        }
        this.gatt = new gatt_1.DbusGattRemote(this, this.busObject);
        return this.gatt;
    }
}
exports.DbusPeripheral = DbusPeripheral;
//# sourceMappingURL=Peripheral.js.map