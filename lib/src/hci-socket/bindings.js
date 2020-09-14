"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const acl_stream_1 = require("./acl-stream");
const gap_1 = require("./gap");
const gatt_1 = __importDefault(require("./gatt"));
const hci_1 = __importDefault(require("./hci"));
const signaling_1 = require("./signaling");
class NobleBindings extends events_1.EventEmitter {
    constructor() {
        super();
        this.state = null;
        this.addresses = new Map();
        this.addressTypes = new Map();
        this.connectable = new Map();
        this.requestedMtu = new Map();
        this.pendingConnectionUUID = null;
        this.connectionQueue = [];
        this.handles = new Map();
        this.gatts = new Map();
        this.aclStreams = new Map();
        this.signalings = new Map();
        this.hci = new hci_1.default();
        this.gap = new gap_1.Gap(this.hci);
    }
    startScanning(serviceUUIDs, allowDuplicates) {
        this.scanServiceUUIDs = serviceUUIDs || [];
        this.gap.startScanning(allowDuplicates);
    }
    stopScanning() {
        this.gap.stopScanning();
    }
    connect(peripheralUUID, requestMtu) {
        const address = this.addresses.get(peripheralUUID);
        const addressType = this.addressTypes.get(peripheralUUID);
        if (requestMtu) {
            this.requestedMtu.set(peripheralUUID, requestMtu);
        }
        else {
            this.requestedMtu.delete(peripheralUUID);
        }
        if (!this.pendingConnectionUUID) {
            this.pendingConnectionUUID = peripheralUUID;
            this.hci.createLeConn(address, addressType);
        }
        else {
            this.connectionQueue.push(peripheralUUID);
        }
    }
    disconnect(peripheralUUID) {
        this.hci.disconnect(this.handles.get(peripheralUUID));
    }
    updateRssi(peripheralUUID) {
        this.hci.readRssi(this.handles.get(peripheralUUID));
    }
    init() {
        this.onSigInt = this.onSigInt.bind(this);
        this.gap.on('scanStart', this.onScanStart.bind(this));
        this.gap.on('scanStop', this.onScanStop.bind(this));
        this.gap.on('discover', this.onDiscover.bind(this));
        this.hci.on('stateChange', this.onStateChange.bind(this));
        this.hci.on('addressChange', this.onAddressChange.bind(this));
        this.hci.on('leConnComplete', this.onLeConnComplete.bind(this));
        this.hci.on('leConnUpdateComplete', this.onLeConnUpdateComplete.bind(this));
        this.hci.on('rssiRead', this.onRssiRead.bind(this));
        this.hci.on('disconnComplete', this.onDisconnComplete.bind(this));
        this.hci.on('encryptChange', this.onEncryptChange.bind(this));
        this.hci.on('aclDataPkt', this.onAclDataPkt.bind(this));
        this.hci.init();
        /* Add exit handlers after `init()` has completed. If no adaptor
        is present it can throw an exception - in which case we don't
        want to try and clear up afterwards (issue #502) */
        process.on('SIGINT', this.onSigInt);
        process.on('exit', this.onExit.bind(this));
    }
    onSigInt() {
        const sigIntListeners = process.listeners('SIGINT');
        if (sigIntListeners[sigIntListeners.length - 1] === this.onSigInt) {
            // we are the last listener, so exit
            // this will trigger onExit, and clean up
            process.exit(1);
        }
    }
    onExit() {
        this.stopScanning();
        for (const handle of this.aclStreams.keys()) {
            this.hci.disconnect(handle);
        }
    }
    onStateChange(state) {
        if (this.state === state) {
            return;
        }
        this.state = state;
        if (state === 'unauthorized') {
            console.log('noble warning: adapter state unauthorized, please run as root or with sudo');
            console.log('               or see README for information on running without root/sudo:');
            console.log('               https://github.com/sandeepmistry/noble#running-on-linux');
        }
        else if (state === 'unsupported') {
            console.log('noble warning: adapter does not support Bluetooth Low Energy (BLE, Bluetooth Smart).');
            console.log('               Try to run with environment variable:');
            console.log('               [sudo] NOBLE_HCI_DEVICE_ID=x node ...');
        }
        this.emit('stateChange', state);
    }
    onAddressChange(address) {
        this.emit('addressChange', address);
    }
    onScanStart(filterDuplicates) {
        this.emit('scanStart', filterDuplicates);
    }
    onScanStop() {
        this.emit('scanStop');
    }
    onDiscover(status, address, addressType, connectable, advertisement, rssi) {
        if (this.scanServiceUUIDs === undefined) {
            return;
        }
        let serviceUuids = advertisement.serviceUuids || [];
        const serviceData = advertisement.serviceData || [];
        let hasScanServiceUuids = this.scanServiceUUIDs.length === 0;
        if (!hasScanServiceUuids) {
            let i;
            serviceUuids = serviceUuids.slice();
            for (i of serviceData) {
                serviceUuids.push(serviceData[i].uuid);
            }
            for (i of serviceUuids) {
                hasScanServiceUuids = this.scanServiceUUIDs.indexOf(serviceUuids[i]) !== -1;
                if (hasScanServiceUuids) {
                    break;
                }
            }
        }
        if (hasScanServiceUuids) {
            const uuid = address.split(':').join('');
            this.addresses.set(uuid, address);
            this.addressTypes.set(uuid, addressType);
            this.connectable.set(uuid, connectable);
            this.emit('discover', uuid, address, addressType, connectable, advertisement, rssi);
        }
    }
    onLeConnComplete(status, handle, role, addressType, address, interval, latency, supervisionTimeout, masterClockAccuracy) {
        if (role !== 0) {
            // not master, ignore
            return;
        }
        let uuid = null;
        let error = null;
        if (status === 0) {
            uuid = address.split(':').join('').toLowerCase();
            const aclStream = new acl_stream_1.AclStream(this.hci, handle, this.hci.addressType, this.hci.address, addressType, address);
            const gatt = new gatt_1.default(address, aclStream);
            const signaling = new signaling_1.Signaling(handle, aclStream);
            this.gatts.set(uuid, gatt);
            this.gatts.set(handle, gatt);
            this.signalings.set(uuid, signaling);
            this.signalings.set(handle, signaling);
            this.aclStreams.set(handle, aclStream);
            this.handles.set(uuid, handle);
            this.handles.set(handle, uuid);
            gatt.on('mtu', this.onMtu.bind(this));
            gatt.on('servicesDiscover', this.onServicesDiscovered.bind(this));
            gatt.on('servicesDiscovered', this.onServicesDiscoveredEX.bind(this));
            gatt.on('includedServicesDiscover', this.onIncludedServicesDiscovered.bind(this));
            gatt.on('characteristicsDiscover', this.onCharacteristicsDiscovered.bind(this));
            gatt.on('characteristicsDiscovered', this.onCharacteristicsDiscoveredEX.bind(this));
            gatt.on('read', this.onRead.bind(this));
            gatt.on('write', this.onWrite.bind(this));
            gatt.on('broadcast', this.onBroadcast.bind(this));
            gatt.on('notify', this.onNotify.bind(this));
            gatt.on('notification', this.onNotification.bind(this));
            gatt.on('descriptorsDiscover', this.onDescriptorsDiscovered.bind(this));
            gatt.on('valueRead', this.onValueRead.bind(this));
            gatt.on('valueWrite', this.onValueWrite.bind(this));
            gatt.on('handleRead', this.onHandleRead.bind(this));
            gatt.on('handleWrite', this.onHandleWrite.bind(this));
            gatt.on('handleNotify', this.onHandleNotify.bind(this));
            signaling.on('connectionParameterUpdateRequest', this.onConnectionParameterUpdateRequest.bind(this));
            const mtu = this.requestedMtu.get(address) || 256;
            this.requestedMtu.delete(address);
            gatt.exchangeMtu(mtu);
        }
        else {
            uuid = this.pendingConnectionUUID;
            let statusMessage = hci_1.default.STATUS_MAPPER[status] || 'HCI Error: Unknown';
            const errorCode = ` (0x${status.toString(16)})`;
            statusMessage = statusMessage + errorCode;
            error = new Error(statusMessage);
        }
        this.emit('connect', uuid, error);
        if (this.connectionQueue.length > 0) {
            const peripheralUUID = this.connectionQueue.shift();
            address = this.addresses.get(peripheralUUID);
            addressType = this.addressTypes.get(peripheralUUID);
            this.pendingConnectionUUID = peripheralUUID;
            this.hci.createLeConn(address, addressType);
        }
        else {
            this.pendingConnectionUUID = null;
        }
    }
    onLeConnUpdateComplete(handle, interval, latency, supervisionTimeout) {
        // NO-OP
    }
    onDisconnComplete(handle, reason) {
        const uuid = this.handles.get(handle);
        if (uuid) {
            this.aclStreams.get(handle).push(null, null);
            this.gatts.get(handle).removeAllListeners();
            this.signalings.get(handle).removeAllListeners();
            this.gatts.delete(uuid);
            this.gatts.delete(handle);
            this.signalings.delete(uuid);
            this.signalings.delete(handle);
            this.aclStreams.delete(handle);
            this.handles.delete(uuid);
            this.handles.delete(handle);
            this.emit('disconnect', uuid, reason);
        }
    }
    onEncryptChange(handle, encrypt) {
        const aclStream = this.aclStreams.get(handle);
        if (aclStream) {
            aclStream.pushEncrypt(encrypt);
        }
    }
    onMtu(address, mtu) {
        const uuid = address.split(':').join('').toLowerCase();
        this.emit('onMtu', uuid, mtu);
    }
    onRssiRead(handle, rssi) {
        this.emit('rssiUpdate', this.handles.get(handle), rssi);
    }
    onAclDataPkt(handle, cid, data) {
        const aclStream = this.aclStreams.get(handle);
        if (aclStream) {
            aclStream.push(cid, data);
        }
    }
    discoverServices(peripheralUUID, uuids) {
        const handle = this.handles.get(peripheralUUID);
        const gatt = this.gatts.get(handle);
        if (gatt) {
            gatt.discoverServices(uuids || []);
        }
    }
    onServicesDiscovered(address, serviceUUIDs) {
        const uuid = address.split(':').join('').toLowerCase();
        this.emit('servicesDiscover', uuid, serviceUUIDs);
    }
    onServicesDiscoveredEX(address, services) {
        const uuid = address.split(':').join('').toLowerCase();
        this.emit('servicesDiscovered', uuid, services);
    }
    discoverIncludedServices(peripheralUUID, serviceUUID, serviceUUIDs) {
        const handle = this.handles.get(peripheralUUID);
        const gatt = this.gatts.get(handle);
        if (gatt) {
            gatt.discoverIncludedServices(serviceUUID, serviceUUIDs || []);
        }
    }
    onIncludedServicesDiscovered(address, serviceUUID, includedServiceUUIDs) {
        const uuid = address.split(':').join('').toLowerCase();
        this.emit('includedServicesDiscover', uuid, serviceUUID, includedServiceUUIDs);
    }
    discoverCharacteristics(peripheralUUID, serviceUUID, characteristicUUIDs) {
        const handle = this.handles.get(peripheralUUID);
        const gatt = this.gatts.get(handle);
        if (gatt) {
            gatt.discoverCharacteristics(serviceUUID, characteristicUUIDs || []);
        }
    }
    onCharacteristicsDiscovered(address, serviceUUID, characteristics) {
        const uuid = address.split(':').join('').toLowerCase();
        this.emit('characteristicsDiscover', uuid, serviceUUID, characteristics);
    }
    onCharacteristicsDiscoveredEX(address, serviceUUID, characteristics) {
        const uuid = address.split(':').join('').toLowerCase();
        this.emit('characteristicsDiscovered', uuid, serviceUUID, characteristics);
    }
    read(peripheralUUID, serviceUUID, characteristicUUID) {
        const handle = this.handles.get(peripheralUUID);
        const gatt = this.gatts.get(handle);
        if (gatt) {
            gatt.read(serviceUUID, characteristicUUID);
        }
    }
    onRead(address, serviceUUID, characteristicUUID, data) {
        const uuid = address.split(':').join('').toLowerCase();
        this.emit('read', uuid, serviceUUID, characteristicUUID, data, false);
    }
    write(peripheralUUID, serviceUUID, characteristicUUID, data, withoutResponse) {
        const handle = this.handles.get(peripheralUUID);
        const gatt = this.gatts.get(handle);
        if (gatt) {
            gatt.write(serviceUUID, characteristicUUID, data, withoutResponse);
        }
    }
    onWrite(address, serviceUUID, characteristicUUID) {
        const uuid = address.split(':').join('').toLowerCase();
        this.emit('write', uuid, serviceUUID, characteristicUUID);
    }
    broadcast(peripheralUUID, serviceUUID, characteristicUUID, broadcast) {
        const handle = this.handles.get(peripheralUUID);
        const gatt = this.gatts.get(handle);
        if (gatt) {
            gatt.broadcast(serviceUUID, characteristicUUID, broadcast);
        }
    }
    onBroadcast(address, serviceUUID, characteristicUUID, state) {
        const uuid = address.split(':').join('').toLowerCase();
        this.emit('broadcast', uuid, serviceUUID, characteristicUUID, state);
    }
    notify(peripheralUUID, serviceUUID, characteristicUUID, notify) {
        const handle = this.handles.get(peripheralUUID);
        const gatt = this.gatts.get(handle);
        if (gatt) {
            gatt.notify(serviceUUID, characteristicUUID, notify);
        }
    }
    onNotify(address, serviceUUID, characteristicUUID, state) {
        const uuid = address.split(':').join('').toLowerCase();
        this.emit('notify', uuid, serviceUUID, characteristicUUID, state);
    }
    onNotification(address, serviceUUID, characteristicUUID, data) {
        const uuid = address.split(':').join('').toLowerCase();
        this.emit('read', uuid, serviceUUID, characteristicUUID, data, true);
    }
    discoverDescriptors(peripheralUUID, serviceUUID, characteristicUUID) {
        const handle = this.handles.get(peripheralUUID);
        const gatt = this.gatts.get(handle);
        if (gatt) {
            gatt.discoverDescriptors(serviceUUID, characteristicUUID);
        }
    }
    onDescriptorsDiscovered(address, serviceUUID, characteristicUUID, descriptorUUIDs) {
        const uuid = address.split(':').join('').toLowerCase();
        this.emit('descriptorsDiscover', uuid, serviceUUID, characteristicUUID, descriptorUUIDs);
    }
    readValue(peripheralUUID, serviceUUID, characteristicUUID, descriptorUUID) {
        const handle = this.handles.get(peripheralUUID);
        const gatt = this.gatts.get(handle);
        if (gatt) {
            gatt.readValue(serviceUUID, characteristicUUID, descriptorUUID);
        }
    }
    onValueRead(address, serviceUUID, characteristicUUID, descriptorUUID, data) {
        const uuid = address.split(':').join('').toLowerCase();
        this.emit('valueRead', uuid, serviceUUID, characteristicUUID, descriptorUUID, data);
    }
    writeValue(peripheralUUID, serviceUUID, characteristicUUID, descriptorUUID, data) {
        const handle = this.handles.get(peripheralUUID);
        const gatt = this.gatts.get(handle);
        if (gatt) {
            gatt.writeValue(serviceUUID, characteristicUUID, descriptorUUID, data);
        }
    }
    onValueWrite(address, serviceUUID, characteristicUUID, descriptorUUID) {
        const uuid = address.split(':').join('').toLowerCase();
        this.emit('valueWrite', uuid, serviceUUID, characteristicUUID, descriptorUUID);
    }
    readHandle(peripheralUUID, attHandle) {
        const handle = this.handles.get(peripheralUUID);
        const gatt = this.gatts.get(handle);
        if (gatt) {
            gatt.readHandle(attHandle);
        }
    }
    onHandleRead(address, handle, data) {
        const uuid = address.split(':').join('').toLowerCase();
        this.emit('handleRead', uuid, handle, data);
    }
    writeHandle(peripheralUUID, attHandle, data, withoutResponse) {
        const handle = this.handles.get(peripheralUUID);
        const gatt = this.gatts.get(handle);
        if (gatt) {
            gatt.writeHandle(attHandle, data, withoutResponse);
        }
    }
    onHandleWrite(address, handle) {
        const uuid = address.split(':').join('').toLowerCase();
        this.emit('handleWrite', uuid, handle);
    }
    onHandleNotify(address, handle, data) {
        const uuid = address.split(':').join('').toLowerCase();
        this.emit('handleNotify', uuid, handle, data);
    }
    onConnectionParameterUpdateRequest(handle, minInterval, maxInterval, latency, supervisionTimeout) {
        this.hci.connUpdateLe(handle, minInterval, maxInterval, latency, supervisionTimeout);
    }
}
exports.default = new NobleBindings();
//# sourceMappingURL=bindings.js.map