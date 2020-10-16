"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbusAdapter = void 0;
const models_1 = require("../../models");
const misc_1 = require("./misc");
const Peripheral_1 = require("./Peripheral");
const UPDATE_INTERVAL = 5; // in seconds
class DbusAdapter extends models_1.Adapter {
    constructor(noble, path, name, address) {
        super(noble, path.replace(`/org/bluez/`, ''));
        this.initialized = false;
        this.scanning = false;
        this.requestScanStop = false;
        this.peripherals = new Map();
        this.onDeviceFound = (path, data) => {
            var _a, _b, _c, _d;
            const id = path.replace(`${this.path}/`, '');
            let peripheral = this.peripherals.get(id);
            if (!peripheral) {
                const address = (_a = data.Address) === null || _a === void 0 ? void 0 : _a.value;
                const addressType = (_b = data.AddressType) === null || _b === void 0 ? void 0 : _b.value;
                const advertisement = (_c = data.ManufacturerData) === null || _c === void 0 ? void 0 : _c.value;
                const rssi = (_d = data.RSSI) === null || _d === void 0 ? void 0 : _d.value;
                peripheral = new Peripheral_1.DbusPeripheral(this, path, id, address, addressType, advertisement, rssi);
                this.peripherals.set(id, peripheral);
            }
            this.emit('discover', peripheral);
        };
        this.updatePeripherals = async () => {
            const objs = await this.objManagerIface.GetManagedObjects();
            const keys = Object.keys(objs);
            for (const devicePath of keys) {
                if (!devicePath.startsWith(this.path)) {
                    continue;
                }
                const deviceObj = objs[devicePath][misc_1.I_BLUEZ_DEVICE];
                if (!deviceObj) {
                    continue;
                }
                this.onDeviceFound(devicePath, deviceObj);
            }
        };
        this.path = path;
        this._name = name;
        this._address = address;
    }
    async init() {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        const objManager = await this.noble.dbus.getProxyObject(`org.bluez`, '/');
        this.objManagerIface = objManager.getInterface(misc_1.I_OBJECT_MANAGER);
        const obj = await this.noble.dbus.getProxyObject(`org.bluez`, this.path);
        this.adapterIface = obj.getInterface(misc_1.I_BLUEZ_ADAPTER);
        this.propsIface = obj.getInterface(misc_1.I_PROPERTIES);
        const onPropertiesChanged = (iface, changedProps) => {
            if (iface !== misc_1.I_BLUEZ_ADAPTER) {
                return;
            }
            if ('Discovering' in changedProps) {
                if (this.scanning && !changedProps.Discovering.value) {
                    this.onScanStop();
                }
                else if (!this.scanning && changedProps.Discovering.value) {
                    this.onScanStart();
                }
            }
        };
        this.propsIface.on('PropertiesChanged', onPropertiesChanged);
    }
    async prop(iface, name) {
        const rawProp = await this.propsIface.Get(iface, name);
        return rawProp.value;
    }
    async getScannedPeripherals() {
        return [...this.peripherals.values()];
    }
    async isScanning() {
        return this.scanning;
    }
    async startScanning() {
        await this.init();
        if (this.scanning) {
            return;
        }
        this.objManagerIface.on('InterfacesAdded', (path, data) => {
            if (!path.startsWith(`${this.path}/`)) {
                return;
            }
            const deviceObj = data[misc_1.I_BLUEZ_DEVICE];
            if (!deviceObj) {
                return;
            }
            this.onDeviceFound(path, deviceObj);
        });
        const scanning = await this.prop(misc_1.I_BLUEZ_ADAPTER, 'Discovering');
        if (!scanning) {
            await this.adapterIface.SetDiscoveryFilter({
                Transport: misc_1.buildTypedValue('string', 'le'),
                DuplicateData: misc_1.buildTypedValue('boolean', false)
            });
            await this.adapterIface.StartDiscovery();
        }
        const objs = await this.objManagerIface.GetManagedObjects();
        const keys = Object.keys(objs);
        for (const key of keys) {
            this.objManagerIface.emit('InterfacesAdded', key, objs[key]);
        }
        this.updateTimer = setInterval(this.updatePeripherals, UPDATE_INTERVAL * 1000);
    }
    onScanStart() {
        this.scanning = true;
    }
    async stopScanning() {
        if (!this.scanning) {
            return;
        }
        clearInterval(this.updateTimer);
        this.updateTimer = null;
        this.requestScanStop = true;
        await this.adapterIface.StopDiscovery();
    }
    onScanStop() {
        this.scanning = false;
        if (this.requestScanStop) {
            this.requestScanStop = false;
            return;
        }
        // Some adapters stop scanning when connecting. We want to automatically start scanning again.
        this.startScanning().catch(() => {
            // NO-OP
        });
    }
    async startAdvertising() {
        throw new Error('Method not implemented.');
    }
    async stopAdvertising() {
        throw new Error('Method not implemented.');
    }
    setupGatt(maxMtu) {
        throw new Error('Method not implemented.');
    }
}
exports.DbusAdapter = DbusAdapter;
//# sourceMappingURL=Adapter.js.map