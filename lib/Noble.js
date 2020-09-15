"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Noble = void 0;
const events_1 = require("events");
const Characteristic_1 = require("./Characteristic");
const Descriptor_1 = require("./Descriptor");
const Peripheral_1 = require("./Peripheral");
const Service_1 = require("./Service");
class Noble extends events_1.EventEmitter {
    constructor(bindings) {
        super();
        this.address = 'unknown';
        this.state = 'unknown';
        this.initialized = false;
        this.bindings = null;
        this.allowDuplicates = false;
        this.discoveredPeripheralUUIDs = new Set();
        this.peripherals = new Map();
        this.onStateChange = (state) => {
            this.state = state;
            this.emit('stateChange', state);
        };
        this.onAddressChange = (address) => {
            this.address = address;
        };
        this.onScanStart = () => {
            this.emit('scanStart');
        };
        this.onScanStop = () => {
            this.emit('scanStop');
        };
        this.onDiscover = (uuid, address, addressType, connectable, advertisement, rssi) => {
            let peripheral = this.peripherals.get(uuid);
            if (!peripheral) {
                peripheral = new Peripheral_1.Peripheral(this, uuid, address, addressType, connectable, advertisement, rssi);
                this.peripherals.set(uuid, peripheral);
            }
            else {
                // "or" the advertisment data with existing
                for (const i in advertisement) {
                    if (advertisement[i] !== undefined) {
                        peripheral.advertisement[i] = advertisement[i];
                    }
                }
                peripheral.connectable = connectable;
                peripheral.rssi = rssi;
            }
            const previouslyDiscoverd = this.discoveredPeripheralUUIDs.has(uuid);
            if (!previouslyDiscoverd) {
                this.discoveredPeripheralUUIDs.add(uuid);
            }
            if (this.allowDuplicates || !previouslyDiscoverd) {
                this.emit('discover', peripheral);
            }
        };
        this.onConnect = (peripheralUUID, error) => {
            const peripheral = this.peripherals.get(peripheralUUID);
            if (peripheral) {
                peripheral.state = error ? 'error' : 'connected';
                peripheral.emit('connect', error);
            }
        };
        this.bindings = bindings;
        this.bindings.on('stateChange', this.onStateChange);
        this.bindings.on('addressChange', this.onAddressChange);
        this.bindings.on('scanStart', this.onScanStart);
        this.bindings.on('scanStop', this.onScanStop);
        this.bindings.on('discover', this.onDiscover);
        this.bindings.on('rssi', this.onRssiUpdate);
        this.bindings.on('connect', this.onConnect);
        this.bindings.on('disconnect', this.onDisconnect);
        this.bindings.on('mtu', this.onMtu);
        this.bindings.on('servicesDiscover', this.onServicesDiscover);
        this.bindings.on('servicesDiscovered', this.onServicesDiscovered);
        this.bindings.on('includedServicesDiscover', this.onIncludedServicesDiscover);
        this.bindings.on('characteristicsDiscover', this.onCharacteristicsDiscover);
        this.bindings.on('characteristicsDiscovered', this.onCharacteristicsDiscovered);
        this.bindings.on('read', this.onRead);
        this.bindings.on('write', this.onWrite);
        this.bindings.on('broadcast', this.onBroadcast);
        this.bindings.on('notify', this.onNotify);
        this.bindings.on('descriptorsDiscover', this.onDescriptorsDiscover);
        this.bindings.on('descriptorsDiscovered', this.onDescriptorsDiscovered);
        this.bindings.on('valueRead', this.onValueRead);
        this.bindings.on('valueWrite', this.onValueWrite);
        this.bindings.on('handleRead', this.onHandleRead);
        this.bindings.on('handleWrite', this.onHandleWrite);
        this.bindings.on('handleNotify', this.onHandleNotify);
    }
    async init(deviceId, timeoutInSeconds) {
        if (!this.initialized) {
            this.initialized = true;
            this.bindings.init(deviceId);
        }
        if (this.state === 'poweredOn') {
            return;
        }
        const doInit = new Promise((resolve) => {
            const callback = (state) => {
                if (state === 'poweredOn') {
                    this.off('stateChange', callback);
                    resolve();
                }
            };
            this.on('stateChange', callback);
        });
        if (!timeoutInSeconds) {
            return doInit;
        }
        const timeout = new Promise((_, reject) => setTimeout(() => reject('Initializing timed out'), timeoutInSeconds * 1000));
        return Promise.race([timeout, doInit]);
    }
    dispose() {
        this.bindings.dispose();
        this.bindings = null;
    }
    async startScanning(serviceUUIDs, allowDuplicates) {
        await this.init();
        this.discoveredPeripheralUUIDs = new Set();
        this.allowDuplicates = allowDuplicates;
        this.bindings.startScanning(serviceUUIDs, allowDuplicates);
        return new Promise((resolve) => this.once('scanStart', () => resolve()));
    }
    async stopScanning() {
        if (!this.bindings || !this.initialized) {
            return;
        }
        this.bindings.stopScanning();
        return new Promise((resolve) => this.once('scanStop', () => resolve()));
    }
    connect(peripheralUUID, requestMtu) {
        this.bindings.connect(peripheralUUID, requestMtu);
    }
    disconnect(peripheralUUID) {
        this.bindings.disconnect(peripheralUUID);
    }
    onDisconnect(peripheralUUID, reason) {
        const peripheral = this.peripherals.get(peripheralUUID);
        if (peripheral) {
            peripheral.state = 'disconnected';
            peripheral.emit('disconnect', reason);
        }
    }
    updateRSSI(peripheralUUID) {
        this.bindings.updateRssi(peripheralUUID);
    }
    onRssiUpdate(peripheralUUID, rssi) {
        const peripheral = this.peripherals.get(peripheralUUID);
        if (peripheral) {
            peripheral.rssi = rssi;
            peripheral.emit('rssiUpdate', rssi);
        }
    }
    discoverServices(peripheralUUID, uuids) {
        this.bindings.discoverServices(peripheralUUID, uuids);
    }
    onServicesDiscover(peripheralUUID, discoveredServices) {
        const peripheral = this.peripherals.get(peripheralUUID);
        if (peripheral) {
            peripheral.emit('servicesDiscover', peripheral, discoveredServices);
        }
    }
    onServicesDiscovered(peripheralUUID, services) {
        const peripheral = this.peripherals.get(peripheralUUID);
        if (!peripheral) {
            return;
        }
        const newServices = new Map();
        for (const service of services) {
            newServices.set(service.uuid, new Service_1.Service(this, peripheralUUID, service.uuid));
        }
        peripheral.services = newServices;
        peripheral.emit('servicesDiscovered', newServices);
    }
    discoverIncludedServices(peripheralUUID, serviceUUID, serviceUUIDs) {
        this.bindings.discoverIncludedServices(peripheralUUID, serviceUUID, serviceUUIDs);
    }
    onIncludedServicesDiscover(peripheralUUID, serviceUUID, includedServiceUUIDs) {
        const peripheral = this.peripherals.get(peripheralUUID);
        if (!peripheral) {
            return;
        }
        const service = peripheral.services.get(serviceUUID);
        if (!service) {
            return;
        }
        service.includedServiceUUIDs = includedServiceUUIDs;
        service.emit('includedServicesDiscover', includedServiceUUIDs);
    }
    discoverCharacteristics(peripheralUUID, serviceUUID, characteristicUUIDs) {
        this.bindings.discoverCharacteristics(peripheralUUID, serviceUUID, characteristicUUIDs);
    }
    onCharacteristicsDiscover(peripheralUUID, serviceUUID, discoveredCharacteristics) {
        const peripheral = this.peripherals.get(peripheralUUID);
        if (!peripheral) {
            return;
        }
        const service = peripheral.services.get(serviceUUID);
        if (!service) {
            return;
        }
        service.emit('characteristicsDiscover', discoveredCharacteristics);
    }
    onCharacteristicsDiscovered(peripheralUUID, serviceUUID, characteristics) {
        const peripheral = this.peripherals.get(peripheralUUID);
        if (!peripheral) {
            return;
        }
        const service = peripheral.services.get(serviceUUID);
        if (!service) {
            return;
        }
        const newCharacteristics = new Map();
        for (const characteristic of characteristics) {
            const char = new Characteristic_1.Characteristic(this, peripheralUUID, serviceUUID, characteristic.uuid, characteristic.properties);
            newCharacteristics.set(characteristic.uuid, char);
        }
        service.characteristics = newCharacteristics;
        service.emit('characteristicsDiscovered', newCharacteristics);
    }
    read(peripheralUUID, serviceUUID, characteristicUUID) {
        this.bindings.read(peripheralUUID, serviceUUID, characteristicUUID);
    }
    onRead(peripheralUUID, serviceUUID, characteristicUUID, data) {
        const peripheral = this.peripherals.get(peripheralUUID);
        if (!peripheral) {
            return;
        }
        const service = peripheral.services.get(serviceUUID);
        if (!service) {
            return;
        }
        const characteristic = service.characteristics.get(characteristicUUID);
        if (!characteristic) {
            return;
        }
        characteristic.emit('read', data);
    }
    write(peripheralUUID, serviceUUID, characteristicUUID, data, withoutResponse) {
        this.bindings.write(peripheralUUID, serviceUUID, characteristicUUID, data, withoutResponse);
    }
    onWrite(peripheralUUID, serviceUUID, characteristicUUID) {
        const peripheral = this.peripherals.get(peripheralUUID);
        if (!peripheral) {
            return;
        }
        const service = peripheral.services.get(serviceUUID);
        if (!service) {
            return;
        }
        const characteristic = service.characteristics.get(characteristicUUID);
        if (!characteristic) {
            return;
        }
        characteristic.emit('write');
    }
    broadcast(peripheralUUID, serviceUUID, characteristicUUID, broadcast) {
        this.bindings.broadcast(peripheralUUID, serviceUUID, characteristicUUID, broadcast);
    }
    onBroadcast(peripheralUUID, serviceUUID, characteristicUUID, state) {
        const peripheral = this.peripherals.get(peripheralUUID);
        if (!peripheral) {
            return;
        }
        const service = peripheral.services.get(serviceUUID);
        if (!service) {
            return;
        }
        const characteristic = service.characteristics.get(characteristicUUID);
        if (!characteristic) {
            return;
        }
        characteristic.emit('broadcast', state);
    }
    notify(peripheralUUID, serviceUUID, characteristicUUID, notify) {
        this.bindings.notify(peripheralUUID, serviceUUID, characteristicUUID, notify);
    }
    onNotify(peripheralUUID, serviceUUID, characteristicUUID, state) {
        const peripheral = this.peripherals.get(peripheralUUID);
        if (!peripheral) {
            return;
        }
        const service = peripheral.services.get(serviceUUID);
        if (!service) {
            return;
        }
        const characteristic = service.characteristics.get(characteristicUUID);
        if (!characteristic) {
            return;
        }
        characteristic.emit('notify', state);
    }
    discoverDescriptors(peripheralUUID, serviceUUID, characteristicUUID) {
        this.bindings.discoverDescriptors(peripheralUUID, serviceUUID, characteristicUUID);
    }
    onDescriptorsDiscover(peripheralUUID, serviceUUID, characteristicUUID, discoveredDescriptors) {
        const peripheral = this.peripherals.get(peripheralUUID);
        if (!peripheral) {
            return;
        }
        const service = peripheral.services.get(serviceUUID);
        if (!service) {
            return;
        }
        const characteristic = service.characteristics.get(characteristicUUID);
        if (!characteristic) {
            return;
        }
        characteristic.emit('descriptorsDiscover', discoveredDescriptors);
    }
    onDescriptorsDiscovered(peripheralUUID, serviceUUID, characteristicUUID, descriptors) {
        const peripheral = this.peripherals.get(peripheralUUID);
        if (!peripheral) {
            return;
        }
        const service = peripheral.services.get(serviceUUID);
        if (!service) {
            return;
        }
        const characteristic = service.characteristics.get(characteristicUUID);
        if (!characteristic) {
            return;
        }
        const newDescriptors = new Map();
        for (const descriptor of descriptors) {
            const desc = new Descriptor_1.Descriptor(this, peripheralUUID, serviceUUID, characteristicUUID, descriptor.uuid);
            newDescriptors.set(descriptor.uuid, desc);
        }
        characteristic.descriptors = newDescriptors;
        characteristic.emit('descriptorsDiscovered', newDescriptors);
    }
    readValue(peripheralUUID, serviceUUID, characteristicUUID, descriptorUUID) {
        this.bindings.readValue(peripheralUUID, serviceUUID, characteristicUUID, descriptorUUID);
    }
    onValueRead(peripheralUUID, serviceUUID, characteristicUUID, descriptorUUID, data) {
        const peripheral = this.peripherals.get(peripheralUUID);
        if (!peripheral) {
            return;
        }
        const service = peripheral.services.get(serviceUUID);
        if (!service) {
            return;
        }
        const characteristic = service.characteristics.get(characteristicUUID);
        if (!characteristic) {
            return;
        }
        const descriptor = characteristic.descriptors.get(descriptorUUID);
        if (!descriptor) {
            return;
        }
        descriptor.emit('valueRead', data);
    }
    writeValue(peripheralUUID, serviceUUID, characteristicUUID, descriptorUUID, data) {
        this.bindings.writeValue(peripheralUUID, serviceUUID, characteristicUUID, descriptorUUID, data);
    }
    onValueWrite(peripheralUUID, serviceUUID, characteristicUUID, descriptorUUID) {
        const peripheral = this.peripherals.get(peripheralUUID);
        if (!peripheral) {
            return;
        }
        const service = peripheral.services.get(serviceUUID);
        if (!service) {
            return;
        }
        const characteristic = service.characteristics.get(characteristicUUID);
        if (!characteristic) {
            return;
        }
        const descriptor = characteristic.descriptors.get(descriptorUUID);
        if (!descriptor) {
            return;
        }
        if (descriptor) {
            descriptor.emit('valueWrite');
        }
    }
    readHandle(peripheralUUID, handle) {
        this.bindings.readHandle(peripheralUUID, handle);
    }
    onHandleRead(peripheralUUID, handle, data) {
        const peripheral = this.peripherals.get(peripheralUUID);
        if (peripheral) {
            peripheral.emit(`handleRead${handle}`, data);
        }
    }
    writeHandle(peripheralUUID, handle, data, withoutResponse) {
        this.bindings.writeHandle(peripheralUUID, handle, data, withoutResponse);
    }
    onHandleWrite(peripheralUUID, handle) {
        const peripheral = this.peripherals.get(peripheralUUID);
        if (peripheral) {
            peripheral.emit(`handleWrite${handle}`);
        }
    }
    onHandleNotify(peripheralUUID, handle, data) {
        const peripheral = this.peripherals.get(peripheralUUID);
        if (peripheral) {
            peripheral.emit('handleNotify', handle, data);
        }
    }
    onMtu(peripheralUUID, mtu) {
        const peripheral = this.peripherals.get(peripheralUUID);
        if (peripheral) {
            peripheral.mtu = mtu;
        }
    }
}
exports.Noble = Noble;
//# sourceMappingURL=Noble.js.map