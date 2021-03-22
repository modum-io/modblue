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
            const id = path.replace(`${this.path}/`, '');
            let peripheral = this.peripherals.get(id);
            if (!peripheral) {
                const address = data.Address?.value.toLowerCase();
                const addressType = data.AddressType?.value;
                const advertisement = data.ManufacturerData?.value;
                const rssi = data.RSSI?.value;
                peripheral = new DbusPeripheral(this, path, id, addressType, address, advertisement, rssi);
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
                const deviceObj = objs[devicePath][I_BLUEZ_DEVICE];
                if (!deviceObj) {
                    continue;
                }
                this.onDeviceFound(devicePath, deviceObj);
            }
        };
        this.path = path;
        this._name = name;
        this._address = address.toLowerCase();
    }
    async init() {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        const objManager = await this.modblue.dbus.getProxyObject(`org.bluez`, '/');
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
        const obj = await this.modblue.dbus.getProxyObject(`org.bluez`, this.path);
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
        this.peripherals.clear();
        const scanning = await this.prop(I_BLUEZ_ADAPTER, 'Discovering');
        if (!scanning) {
            await this.adapterIface.SetDiscoveryFilter({
                Transport: buildTypedValue('string', 'le'),
                DuplicateData: buildTypedValue('boolean', false)
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
    async isAdvertising() {
        return false;
    }
    async startAdvertising() {
        throw new Error('Method not implemented.');
    }
    async stopAdvertising() {
        throw new Error('Method not implemented.');
    }
    setupGatt() {
        throw new Error('Method not implemented.');
    }
}
//# sourceMappingURL=Adapter.js.map