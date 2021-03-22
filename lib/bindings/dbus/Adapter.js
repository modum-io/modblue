var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Adapter } from '../../models';
import { buildTypedValue, I_BLUEZ_ADAPTER, I_BLUEZ_DEVICE, I_OBJECT_MANAGER, I_PROPERTIES } from './misc';
import { DbusPeripheral } from './Peripheral';
const UPDATE_INTERVAL = 5; // in seconds
export class DbusAdapter extends Adapter {
    constructor(modblue, path, name, address) {
        super(modblue, path.replace(`/org/bluez/`, ''));
        this.initialized = false;
        this.scanning = false;
        this.requestScanStop = false;
        this.peripherals = new Map();
        this.onDeviceFound = (path, data) => {
            var _a, _b, _c, _d;
            const id = path.replace(`${this.path}/`, '');
            let peripheral = this.peripherals.get(id);
            if (!peripheral) {
                const address = ((_a = data.Address) === null || _a === void 0 ? void 0 : _a.value).toLowerCase();
                const addressType = (_b = data.AddressType) === null || _b === void 0 ? void 0 : _b.value;
                const advertisement = (_c = data.ManufacturerData) === null || _c === void 0 ? void 0 : _c.value;
                const rssi = (_d = data.RSSI) === null || _d === void 0 ? void 0 : _d.value;
                peripheral = new DbusPeripheral(this, path, id, addressType, address, advertisement, rssi);
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
                const deviceObj = objs[devicePath][I_BLUEZ_DEVICE];
                if (!deviceObj) {
                    continue;
                }
                this.onDeviceFound(devicePath, deviceObj);
            }
        });
        this.path = path;
        this._name = name;
        this._address = address.toLowerCase();
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.initialized) {
                return;
            }
            this.initialized = true;
            const objManager = yield this.modblue.dbus.getProxyObject(`org.bluez`, '/');
            this.objManagerIface = objManager.getInterface(I_OBJECT_MANAGER);
            this.objManagerIface.on('InterfacesAdded', (path, data) => {
                if (!path.startsWith(`${this.path}/`)) {
                    return;
                }
                const deviceObj = data[I_BLUEZ_DEVICE];
                if (!deviceObj) {
                    return;
                }
                if (this.scanning) {
                    this.onDeviceFound(path, deviceObj);
                }
            });
            const obj = yield this.modblue.dbus.getProxyObject(`org.bluez`, this.path);
            this.adapterIface = obj.getInterface(I_BLUEZ_ADAPTER);
            this.propsIface = obj.getInterface(I_PROPERTIES);
            const onPropertiesChanged = (iface, changedProps) => {
                if (iface !== I_BLUEZ_ADAPTER) {
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
            const scanning = yield this.prop(I_BLUEZ_ADAPTER, 'Discovering');
            if (!scanning) {
                yield this.adapterIface.SetDiscoveryFilter({
                    Transport: buildTypedValue('string', 'le'),
                    DuplicateData: buildTypedValue('boolean', false)
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
        throw new Error('Method not implemented.');
    }
}
//# sourceMappingURL=Adapter.js.map