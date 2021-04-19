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
exports.DbusAdapter = void 0;
const models_1 = require("../../models");
const misc_1 = require("./misc");
const Peripheral_1 = require("./Peripheral");
const UPDATE_INTERVAL = 5; // in seconds
class DbusAdapter extends models_1.Adapter {
    constructor(modblue, path, name, address) {
        super(modblue, path.replace(`/org/bluez/`, ''), name, address);
        this.initialized = false;
        this.scanning = false;
        this.requestScanStop = false;
        this.peripherals = new Map();
        this.onDeviceFound = (path, data) => {
            var _a, _b, _c, _d, _e;
            const id = path.replace(`${this.path}/`, '');
            let peripheral = this.peripherals.get(id);
            if (!peripheral) {
                const name = (_a = data.Name) === null || _a === void 0 ? void 0 : _a.value;
                const address = ((_b = data.Address) === null || _b === void 0 ? void 0 : _b.value).toLowerCase();
                const addressType = (_c = data.AddressType) === null || _c === void 0 ? void 0 : _c.value;
                const advertisement = (_d = data.ManufacturerData) === null || _d === void 0 ? void 0 : _d.value;
                let manufacturerData = null;
                if (advertisement) {
                    manufacturerData = Buffer.alloc(0);
                    for (const key of Object.keys(advertisement)) {
                        const prefix = Buffer.alloc(2);
                        prefix.writeUInt16LE(Number(key));
                        manufacturerData = Buffer.concat([manufacturerData, prefix, advertisement[key].value]);
                    }
                }
                const rssi = (_e = data.RSSI) === null || _e === void 0 ? void 0 : _e.value;
                peripheral = new Peripheral_1.DbusPeripheral(this, path, id, name, addressType, address, manufacturerData, rssi);
                this.peripherals.set(id, peripheral);
            }
            this.emit('discover', peripheral);
        };
        this.updatePeripherals = () => __awaiter(this, void 0, void 0, function* () {
            const objs = yield this.objManagerIface.GetManagedObjects();
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
        });
        this.path = path;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.initialized) {
                return;
            }
            this.initialized = true;
            const objManager = yield this.modblue.dbus.getProxyObject(`org.bluez`, '/');
            this.objManagerIface = objManager.getInterface(misc_1.I_OBJECT_MANAGER);
            this.objManagerIface.on('InterfacesAdded', (path, data) => {
                if (!path.startsWith(`${this.path}/`)) {
                    return;
                }
                const deviceObj = data[misc_1.I_BLUEZ_DEVICE];
                if (!deviceObj) {
                    return;
                }
                if (this.scanning) {
                    this.onDeviceFound(path, deviceObj);
                }
            });
            const obj = yield this.modblue.dbus.getProxyObject(`org.bluez`, this.path);
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
        });
    }
    prop(iface, name) {
        return __awaiter(this, void 0, void 0, function* () {
            const rawProp = yield this.propsIface.Get(iface, name);
            return rawProp.value;
        });
    }
    getScannedPeripherals() {
        return __awaiter(this, void 0, void 0, function* () {
            return [...this.peripherals.values()];
        });
    }
    isScanning() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.scanning;
        });
    }
    startScanning() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.init();
            if (this.scanning) {
                return;
            }
            this.peripherals.clear();
            const scanning = yield this.prop(misc_1.I_BLUEZ_ADAPTER, 'Discovering');
            if (!scanning) {
                yield this.adapterIface.SetDiscoveryFilter({
                    Transport: misc_1.buildTypedValue('string', 'le'),
                    DuplicateData: misc_1.buildTypedValue('boolean', false)
                });
                yield this.adapterIface.StartDiscovery();
            }
            const objs = yield this.objManagerIface.GetManagedObjects();
            const keys = Object.keys(objs);
            for (const key of keys) {
                this.objManagerIface.emit('InterfacesAdded', key, objs[key]);
            }
            this.updateTimer = setInterval(this.updatePeripherals, UPDATE_INTERVAL * 1000);
        });
    }
    onScanStart() {
        this.scanning = true;
    }
    stopScanning() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.scanning) {
                return;
            }
            clearInterval(this.updateTimer);
            this.updateTimer = null;
            this.requestScanStop = true;
            yield this.adapterIface.StopDiscovery();
        });
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
    isAdvertising() {
        return __awaiter(this, void 0, void 0, function* () {
            return false;
        });
    }
    startAdvertising() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Method not implemented.');
        });
    }
    stopAdvertising() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Method not implemented.');
        });
    }
    setupGatt() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Method not implemented.');
        });
    }
}
exports.DbusAdapter = DbusAdapter;
//# sourceMappingURL=Adapter.js.map