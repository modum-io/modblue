"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbusPeripheral = void 0;
const Peripheral_1 = require("../../Peripheral");
const BusObject_1 = require("./BusObject");
const Service_1 = require("./Service");
// tslint:disable: promise-must-complete
const CONNECT_TIMEOUT = 10; // in seconds
class DbusPeripheral extends Peripheral_1.Peripheral {
    constructor(noble, adapter, id, address, addressType, object) {
        super(noble, adapter, id, address, addressType);
        this.services = new Map();
        this.isConnecting = false;
        this.connecting = [];
        this.isDisconnecting = false;
        this.disconnecting = [];
        this.object = object;
    }
    prop(propName) {
        return this.object.prop(BusObject_1.I_BLUEZ_DEVICE, propName);
    }
    callMethod(methodName, ...args) {
        return this.object.callMethod(BusObject_1.I_BLUEZ_DEVICE, methodName, ...args);
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
            const propertiesIface = await this.object.getPropertiesInterface();
            const onPropertiesChanged = (iface, changedProps) => {
                if (iface !== BusObject_1.I_BLUEZ_DEVICE) {
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
            const propertiesIface = await this.object.getPropertiesInterface();
            const onPropertiesChanged = (iface, changedProps) => {
                if (iface !== BusObject_1.I_BLUEZ_DEVICE) {
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
    getDiscoveredServices() {
        return [...this.services.values()];
    }
    discoverServices(serviceUUIDs) {
        return new Promise(async (resolve, reject) => {
            let cancelled = false;
            const onTimeout = () => {
                cancelled = true;
                reject(new Error('Discovering timed out'));
            };
            const timeout = setTimeout(onTimeout, CONNECT_TIMEOUT * 1000);
            const servicesResolved = await this.prop('ServicesResolved');
            if (!servicesResolved) {
                await new Promise(async (res) => {
                    const propertiesIface = await this.object.getPropertiesInterface();
                    const onPropertiesChanged = (iface, changedProps) => {
                        if (iface !== BusObject_1.I_BLUEZ_DEVICE) {
                            return;
                        }
                        if ('ServicesResolved' in changedProps && changedProps.ServicesResolved.value) {
                            propertiesIface.off('PropertiesChanged', onPropertiesChanged);
                            res();
                        }
                    };
                    propertiesIface.on('PropertiesChanged', onPropertiesChanged);
                });
            }
            if (cancelled) {
                // If we canceled by timeout then all the promises have already been rejected, so just return.
                return;
            }
            else {
                clearTimeout(timeout);
            }
            const serviceIds = await this.object.getChildrenNames();
            for (const serviceId of serviceIds) {
                let service = this.services.get(serviceId);
                if (!service) {
                    const object = this.object.getChild(serviceId);
                    const uuid = (await object.prop(BusObject_1.I_BLUEZ_SERVICE, 'UUID')).replace(/\-/g, '');
                    service = new Service_1.DbusService(this.noble, this, uuid, object);
                    this.services.set(uuid, service);
                }
            }
            resolve([...this.services.values()]);
        });
    }
}
exports.DbusPeripheral = DbusPeripheral;
//# sourceMappingURL=Peripheral.js.map