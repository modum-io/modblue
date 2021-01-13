"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbusPeripheral = void 0;
const models_1 = require("../../models");
const gatt_1 = require("./gatt");
const misc_1 = require("./misc");
// tslint:disable: promise-must-complete
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
    async init() {
        if (this._init) {
            return;
        }
        const obj = await this.adapter.modblue.dbus.getProxyObject('org.bluez', this.path);
        this.propsIface = obj.getInterface(misc_1.I_PROPERTIES);
        this.deviceIface = obj.getInterface(misc_1.I_BLUEZ_DEVICE);
        this._init = true;
    }
    async prop(iface, name) {
        await this.init();
        const rawProp = await this.propsIface.Get(iface, name);
        return rawProp.value;
    }
    async isConnected() {
        return this.prop(misc_1.I_BLUEZ_DEVICE, 'Connected');
    }
    async connect() {
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
            await this.init();
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
            const timeout = async () => {
                this.doneConnecting('Connecting timed out');
                this.propsIface.off('PropertiesChanged', onPropertiesChanged);
                try {
                    // Disconnect can be used to cancel pending connects
                    await this.deviceIface.Disconnect();
                }
                catch (_a) {
                    // NO-OP
                }
            };
            this.connectTimeout = setTimeout(timeout, CONNECT_TIMEOUT * 1000);
            try {
                await this.deviceIface.Connect();
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
        this.disconnecting = [];
        this.isDisconnecting = true;
        return new Promise(async (resolve, reject) => {
            this.disconnecting.push([resolve, reject]);
            const done = () => this.doneDisconnecting();
            await this.init();
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
                this.doneDisconnecting('Disconnecting timed out');
                this.propsIface.off('PropertiesChanged', onPropertiesChanged);
            };
            this.disconnectTimeout = setTimeout(timeout, CONNECT_TIMEOUT * 1000);
            try {
                await this.deviceIface.Disconnect();
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
        this.gatt = new gatt_1.DbusGattRemote(this);
        return this.gatt;
    }
}
exports.DbusPeripheral = DbusPeripheral;
//# sourceMappingURL=Peripheral.js.map