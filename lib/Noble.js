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
        this.initialized = false;
        this.bindings = null;
        this.address = 'unknown';
        this.state = 'unknown';
        this.allowDuplicates = false;
        this.discoveredPeripheralUUIDs = new Set();
        this.peripherals = new Map();
        this.bindings = bindings;
        this.bindings.on('stateChange', this.onStateChange.bind(this));
        this.bindings.on('addressChange', this.onAddressChange.bind(this));
        this.bindings.on('scanStart', this.onScanStart.bind(this));
        this.bindings.on('scanStop', this.onScanStop.bind(this));
        this.bindings.on('discover', this.onDiscover.bind(this));
        this.bindings.on('connect', this.onConnect.bind(this));
        this.bindings.on('disconnect', this.onDisconnect.bind(this));
        this.bindings.on('rssiUpdate', this.onRssiUpdate.bind(this));
        this.bindings.on('servicesDiscover', this.onServicesDiscover.bind(this));
        this.bindings.on('servicesDiscovered', this.onServicesDiscovered.bind(this));
        this.bindings.on('includedServicesDiscover', this.onIncludedServicesDiscover.bind(this));
        this.bindings.on('characteristicsDiscover', this.onCharacteristicsDiscover.bind(this));
        this.bindings.on('characteristicsDiscovered', this.onCharacteristicsDiscovered.bind(this));
        this.bindings.on('read', this.onRead.bind(this));
        this.bindings.on('write', this.onWrite.bind(this));
        this.bindings.on('broadcast', this.onBroadcast.bind(this));
        this.bindings.on('notify', this.onNotify.bind(this));
        this.bindings.on('descriptorsDiscover', this.onDescriptorsDiscover.bind(this));
        this.bindings.on('valueRead', this.onValueRead.bind(this));
        this.bindings.on('valueWrite', this.onValueWrite.bind(this));
        this.bindings.on('handleRead', this.onHandleRead.bind(this));
        this.bindings.on('handleWrite', this.onHandleWrite.bind(this));
        this.bindings.on('handleNotify', this.onHandleNotify.bind(this));
        this.bindings.on('onMtu', this.onMtu.bind(this));
    }
    async init() {
        if (!this.initialized) {
            this.initialized = true;
            this.bindings.init();
        }
        if (this.state === 'poweredOn') {
            return;
        }
        return new Promise((resolve) => {
            const callback = (state) => {
                if (state === 'poweredOn') {
                    this.off('stateChange', callback);
                    resolve();
                }
            };
            this.on('stateChange', callback);
        });
    }
    onStateChange(state) {
        this.state = state;
        this.emit('stateChange', state);
    }
    onAddressChange(address) {
        this.address = address;
    }
    async startScanning(serviceUUIDs, allowDuplicates) {
        await this.init();
        this.discoveredPeripheralUUIDs = new Set();
        this.allowDuplicates = allowDuplicates;
        this.bindings.startScanning(serviceUUIDs, allowDuplicates);
        return new Promise((resolve) => this.once('scanStart', () => resolve()));
    }
    onScanStart() {
        this.emit('scanStart');
    }
    async stopScanning() {
        if (!this.bindings || !this.initialized) {
            return;
        }
        this.bindings.stopScanning();
        return new Promise((resolve) => this.once('scanStop', () => resolve()));
    }
    onScanStop() {
        this.emit('scanStop');
    }
    onDiscover(uuid, address, addressType, connectable, advertisement, rssi) {
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
    }
    connect(peripheralUUID, requestMtu) {
        this.bindings.connect(peripheralUUID, requestMtu);
    }
    onConnect(peripheralUUID, error) {
        const peripheral = this.peripherals.get(peripheralUUID);
        if (peripheral) {
            peripheral.state = error ? 'error' : 'connected';
            peripheral.emit('connect', error);
        }
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
    onServicesDiscovered(peripheralUUID, services) {
        const peripheral = this.peripherals.get(peripheralUUID);
        if (peripheral) {
            peripheral.emit('servicesDiscovered', peripheral, services);
        }
    }
    discoverServices(peripheralUUID, uuids) {
        this.bindings.discoverServices(peripheralUUID, uuids);
    }
    onServicesDiscover(peripheralUUID, serviceUUIDs) {
        const peripheral = this.peripherals.get(peripheralUUID);
        if (!peripheral) {
            return;
        }
        const newServices = new Map();
        for (const serviceUUID of serviceUUIDs) {
            newServices.set(serviceUUID, new Service_1.Service(this, peripheralUUID, serviceUUID));
        }
        peripheral.services = newServices;
        peripheral.emit('servicesDiscover', newServices);
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
    onCharacteristicsDiscovered(peripheralUUID, serviceUUID, characteristics) {
        const peripheral = this.peripherals.get(peripheralUUID);
        if (!peripheral) {
            return;
        }
        const service = peripheral.services.get(serviceUUID);
        if (!service) {
            return;
        }
        service.emit('characteristicsDiscovered', characteristics);
    }
    discoverCharacteristics(peripheralUUID, serviceUUID, characteristicUUIDs) {
        this.bindings.discoverCharacteristics(peripheralUUID, serviceUUID, characteristicUUIDs);
    }
    onCharacteristicsDiscover(peripheralUUID, serviceUUID, characteristics) {
        const peripheral = this.peripherals.get(peripheralUUID);
        if (!peripheral) {
            return;
        }
        const service = peripheral.services.get(serviceUUID);
        if (!service) {
            return;
        }
        const newCharacteristics = new Map();
        for (const rawCharacteristic of characteristics) {
            const characteristicUUID = rawCharacteristic.uuid;
            const characteristic = new Characteristic_1.Characteristic(this, peripheralUUID, serviceUUID, characteristicUUID, rawCharacteristic.properties);
            newCharacteristics.set(characteristicUUID, characteristic);
        }
        service.characteristics = newCharacteristics;
        service.emit('characteristicsDiscover', newCharacteristics);
    }
    read(peripheralUUID, serviceUUID, characteristicUUID) {
        this.bindings.read(peripheralUUID, serviceUUID, characteristicUUID);
    }
    onRead(peripheralUUID, serviceUUID, characteristicUUID, data, isNotification) {
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
        characteristic.emit('data', data, isNotification);
        characteristic.emit('read', data, isNotification); // for backwards compatbility
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
    onDescriptorsDiscover(peripheralUUID, serviceUUID, characteristicUUID, descriptorUUIDs) {
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
        for (const descriptorUUID of descriptorUUIDs) {
            const descriptor = new Descriptor_1.Descriptor(this, peripheralUUID, serviceUUID, characteristicUUID, descriptorUUID);
            newDescriptors.set(descriptorUUID, descriptor);
        }
        characteristic.descriptors = newDescriptors;
        characteristic.emit('descriptorsDiscover', newDescriptors);
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