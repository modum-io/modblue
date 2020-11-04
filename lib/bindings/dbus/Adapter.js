"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbusAdapter = void 0;
const models_1 = require("../../models");
const BusObject_1 = require("./BusObject");
const Peripheral_1 = require("./Peripheral");
const TypeValue_1 = require("./TypeValue");
const UPDATE_INTERVAL = 1; // in seconds
class DbusAdapter extends models_1.Adapter {
    constructor(noble, id, name, address, object) {
        super(noble, id);
        this.initialized = false;
        this.scanning = false;
        this.requestScanStop = false;
        this.peripherals = new Map();
        this._name = name;
        this._address = address;
        this.object = object;
    }
    async init() {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        const propertiesIface = await this.object.getPropertiesInterface();
        const onPropertiesChanged = (iface, changedProps) => {
            if (iface !== BusObject_1.I_BLUEZ_ADAPTER) {
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
        propertiesIface.on('PropertiesChanged', onPropertiesChanged);
    }
    prop(propName) {
        return this.object.prop(BusObject_1.I_BLUEZ_ADAPTER, propName);
    }
    callMethod(methodName, ...args) {
        return this.object.callMethod(BusObject_1.I_BLUEZ_ADAPTER, methodName, ...args);
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
        this.updateTimer = setInterval(() => this.updatePeripherals(), UPDATE_INTERVAL * 1000);
        const scanning = await this.prop('Discovering');
        if (scanning) {
            this.onScanStart();
            return;
        }
        await this.callMethod('SetDiscoveryFilter', {
            Transport: TypeValue_1.buildTypedValue('string', 'le'),
            DuplicateData: TypeValue_1.buildTypedValue('boolean', false)
        });
        await this.callMethod('StartDiscovery');
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
        await this.callMethod('StopDiscovery');
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
    async updatePeripherals() {
        const peripheralIds = await this.object.getChildrenNames();
        for (const peripheralId of peripheralIds) {
            let peripheral = this.peripherals.get(peripheralId);
            if (!peripheral) {
                const object = this.object.getChild(peripheralId);
                const address = await object.prop(BusObject_1.I_BLUEZ_DEVICE, 'Address');
                const addressType = await object.prop(BusObject_1.I_BLUEZ_DEVICE, 'AddressType');
                peripheral = new Peripheral_1.DbusPeripheral(this.noble, this, peripheralId, address, addressType, object);
                this.peripherals.set(peripheralId, peripheral);
            }
            if (this.scanning) {
                // TODO: Devices are not removed from the list when they aren't detected anymore
                this.emit('discover', peripheral);
            }
        }
    }
}
exports.DbusAdapter = DbusAdapter;
//# sourceMappingURL=Adapter.js.map