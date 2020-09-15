"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HciBindings = void 0;
const Bindings_1 = require("../Bindings");
const acl_stream_1 = require("./acl-stream");
const gap_1 = require("./gap");
const gatt_1 = require("./gatt");
const hci_1 = require("./hci");
const signaling_1 = require("./signaling");
class HciBindings extends Bindings_1.NobleBindings {
    constructor() {
        super();
        this.onSigInt = () => {
            const sigIntListeners = process.listeners('SIGINT');
            if (sigIntListeners[sigIntListeners.length - 1] === this.onSigInt) {
                // we are the last listener, so exit
                // this will trigger onExit, and clean up
                process.exit(1);
            }
        };
        this.onExit = () => {
            this.stopScanning();
            for (const handle of this.aclStreams.keys()) {
                this.hci.disconnect(handle);
            }
        };
        this.onStateChange = (state) => {
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
        };
        this.onAddressChange = (address) => {
            this.emit('addressChange', address);
        };
        this.onScanStart = (filterDuplicates) => {
            this.emit('scanStart', filterDuplicates);
        };
        this.onScanStop = () => {
            this.emit('scanStop');
        };
        this.onDiscover = (status, address, addressType, connectable, advertisement, rssi) => {
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
        };
        this.onLeConnComplete = (status, handle, role, addressType, address, interval, latency, supervisionTimeout, masterClockAccuracy) => {
            if (role !== 0) {
                // not master, ignore
                return;
            }
            let uuid = null;
            let error = null;
            if (status === 0) {
                uuid = address.split(':').join('').toLowerCase();
                const aclStream = new acl_stream_1.AclStream(this.hci, handle, this.hci.addressType, this.hci.address, addressType, address);
                const gatt = new gatt_1.Gatt(address, aclStream);
                const signaling = new signaling_1.Signaling(handle, aclStream);
                this.gatts.set(handle, gatt);
                this.signalings.set(handle, signaling);
                this.aclStreams.set(handle, aclStream);
                this.handleToUUID.set(handle, uuid);
                this.uuidToHandle.set(uuid, handle);
                gatt.on('mtu', this.onMtu);
                gatt.on('servicesDiscover', this.onServicesDiscover);
                gatt.on('servicesDiscovered', this.onServicesDiscovered);
                gatt.on('includedServicesDiscover', this.onIncludedServicesDiscovered);
                gatt.on('characteristicsDiscover', this.onCharacteristicsDiscover);
                gatt.on('characteristicsDiscovered', this.onCharacteristicsDiscovered);
                gatt.on('read', this.onRead);
                gatt.on('write', this.onWrite);
                gatt.on('broadcast', this.onBroadcast);
                gatt.on('notify', this.onNotify);
                gatt.on('notification', this.onNotification);
                gatt.on('descriptorsDiscover', this.onDescriptorsDiscover);
                gatt.on('descriptorsDiscovered', this.onDescriptorsDiscovered);
                gatt.on('valueRead', this.onValueRead);
                gatt.on('valueWrite', this.onValueWrite);
                gatt.on('handleRead', this.onHandleRead);
                gatt.on('handleWrite', this.onHandleWrite);
                gatt.on('handleNotify', this.onHandleNotify);
                signaling.on('connectionParameterUpdateRequest', this.onConnectionParameterUpdateRequest);
                const mtu = this.requestedMtu.get(address) || 256;
                this.requestedMtu.delete(address);
                gatt.exchangeMtu(mtu);
            }
            else {
                uuid = this.pendingConnectionUUID;
                let statusMessage = hci_1.Hci.STATUS_MAPPER[status] || 'HCI Error: Unknown';
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
        };
        this.onLeConnUpdateComplete = (handle, interval, latency, supervisionTimeout) => {
            // NO-OP
        };
        this.onDisconnComplete = (handle, reason) => {
            const uuid = this.handleToUUID.get(handle);
            if (uuid) {
                this.aclStreams.get(handle).push(null, null);
                this.gatts.get(handle).removeAllListeners();
                this.signalings.get(handle).removeAllListeners();
                this.gatts.delete(handle);
                this.signalings.delete(handle);
                this.aclStreams.delete(handle);
                this.uuidToHandle.delete(uuid);
                this.handleToUUID.delete(handle);
                this.emit('disconnect', uuid, reason);
            }
        };
        this.onEncryptChange = (handle, encrypt) => {
            const aclStream = this.aclStreams.get(handle);
            if (aclStream) {
                aclStream.pushEncrypt(encrypt);
            }
        };
        this.onMtu = (address, mtu) => {
            const uuid = address.split(':').join('').toLowerCase();
            this.emit('mtu', uuid, mtu);
        };
        this.onRssiRead = (handle, rssi) => {
            this.emit('rssi', this.handleToUUID.get(handle), rssi);
        };
        this.onAclDataPkt = (handle, cid, data) => {
            const aclStream = this.aclStreams.get(handle);
            if (aclStream) {
                aclStream.push(cid, data);
            }
        };
        this.onServicesDiscover = (address, discoveredServices) => {
            const uuid = address.split(':').join('').toLowerCase();
            this.emit('servicesDiscover', uuid, discoveredServices);
        };
        this.onServicesDiscovered = (address, services) => {
            const uuid = address.split(':').join('').toLowerCase();
            this.emit('servicesDiscovered', uuid, services);
        };
        this.onIncludedServicesDiscovered = (address, serviceUUID, includedServiceUUIDs) => {
            const uuid = address.split(':').join('').toLowerCase();
            this.emit('includedServicesDiscover', uuid, serviceUUID, includedServiceUUIDs);
        };
        this.onCharacteristicsDiscover = (address, serviceUUID, discoveredCharacteristics) => {
            const uuid = address.split(':').join('').toLowerCase();
            this.emit('characteristicsDiscover', uuid, serviceUUID, discoveredCharacteristics);
        };
        this.onCharacteristicsDiscovered = (address, serviceUUID, characteristics) => {
            const uuid = address.split(':').join('').toLowerCase();
            this.emit('characteristicsDiscovered', uuid, serviceUUID, characteristics);
        };
        this.onRead = (address, serviceUUID, characteristicUUID, data) => {
            const uuid = address.split(':').join('').toLowerCase();
            this.emit('read', uuid, serviceUUID, characteristicUUID, data);
        };
        this.onWrite = (address, serviceUUID, characteristicUUID) => {
            const uuid = address.split(':').join('').toLowerCase();
            this.emit('write', uuid, serviceUUID, characteristicUUID);
        };
        this.onBroadcast = (address, serviceUUID, characteristicUUID, state) => {
            const uuid = address.split(':').join('').toLowerCase();
            this.emit('broadcast', uuid, serviceUUID, characteristicUUID, state);
        };
        this.onNotify = (address, serviceUUID, characteristicUUID, state) => {
            const uuid = address.split(':').join('').toLowerCase();
            this.emit('notify', uuid, serviceUUID, characteristicUUID, state);
        };
        this.onNotification = (address, serviceUUID, characteristicUUID, data) => {
            const uuid = address.split(':').join('').toLowerCase();
            this.emit('notification', uuid, serviceUUID, characteristicUUID, data);
        };
        this.onDescriptorsDiscover = (address, serviceUUID, characteristicUUID, discoveredDescriptors) => {
            const uuid = address.split(':').join('').toLowerCase();
            this.emit('descriptorsDiscover', uuid, serviceUUID, characteristicUUID, discoveredDescriptors);
        };
        this.onDescriptorsDiscovered = (address, serviceUUID, characteristicUUID, descriptors) => {
            const uuid = address.split(':').join('').toLowerCase();
            this.emit('descriptorsDiscovered', uuid, serviceUUID, characteristicUUID, descriptors);
        };
        this.onValueRead = (address, serviceUUID, characteristicUUID, descriptorUUID, data) => {
            const uuid = address.split(':').join('').toLowerCase();
            this.emit('valueRead', uuid, serviceUUID, characteristicUUID, descriptorUUID, data);
        };
        this.onValueWrite = (address, serviceUUID, characteristicUUID, descriptorUUID) => {
            const uuid = address.split(':').join('').toLowerCase();
            this.emit('valueWrite', uuid, serviceUUID, characteristicUUID, descriptorUUID);
        };
        this.onHandleRead = (address, handle, data) => {
            const uuid = address.split(':').join('').toLowerCase();
            this.emit('handleRead', uuid, handle, data);
        };
        this.onHandleWrite = (address, handle) => {
            const uuid = address.split(':').join('').toLowerCase();
            this.emit('handleWrite', uuid, handle);
        };
        this.onHandleNotify = (address, handle, data) => {
            const uuid = address.split(':').join('').toLowerCase();
            this.emit('handleNotify', uuid, handle, data);
        };
        this.onConnectionParameterUpdateRequest = (handle, minInterval, maxInterval, latency, supervisionTimeout) => {
            this.hci.connUpdateLe(handle, minInterval, maxInterval, latency, supervisionTimeout);
        };
        this.state = null;
        this.addresses = new Map();
        this.addressTypes = new Map();
        this.connectable = new Map();
        this.requestedMtu = new Map();
        this.pendingConnectionUUID = null;
        this.connectionQueue = [];
        this.uuidToHandle = new Map();
        this.handleToUUID = new Map();
        this.gatts = new Map();
        this.aclStreams = new Map();
        this.signalings = new Map();
        this.hci = new hci_1.Hci();
        this.gap = new gap_1.Gap(this.hci);
        this.gap.on('scanStart', this.onScanStart);
        this.gap.on('scanStop', this.onScanStop);
        this.gap.on('discover', this.onDiscover);
        this.hci.on('stateChange', this.onStateChange);
        this.hci.on('addressChange', this.onAddressChange);
        this.hci.on('leConnComplete', this.onLeConnComplete);
        this.hci.on('leConnUpdateComplete', this.onLeConnUpdateComplete);
        this.hci.on('rssiRead', this.onRssiRead);
        this.hci.on('disconnComplete', this.onDisconnComplete);
        this.hci.on('encryptChange', this.onEncryptChange);
        this.hci.on('aclDataPkt', this.onAclDataPkt);
    }
    getDevices() {
        return this.hci.getDevices().map((dev) => ({ id: dev.devId, address: null }));
    }
    init(deviceId) {
        this.hci.init(deviceId);
        /* Add exit handlers after `init()` has completed. If no adaptor
        is present it can throw an exception - in which case we don't
        want to try and clear up afterwards (issue #502) */
        process.on('SIGINT', this.onSigInt);
        process.on('exit', this.onExit);
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
        this.hci.disconnect(this.uuidToHandle.get(peripheralUUID));
    }
    updateRssi(peripheralUUID) {
        this.hci.readRssi(this.uuidToHandle.get(peripheralUUID));
    }
    discoverServices(peripheralUUID, uuids) {
        const handle = this.uuidToHandle.get(peripheralUUID);
        const gatt = this.gatts.get(handle);
        if (gatt) {
            gatt.discoverServices(uuids || []);
        }
    }
    discoverIncludedServices(peripheralUUID, serviceUUID, serviceUUIDs) {
        const handle = this.uuidToHandle.get(peripheralUUID);
        const gatt = this.gatts.get(handle);
        if (gatt) {
            gatt.discoverIncludedServices(serviceUUID, serviceUUIDs || []);
        }
    }
    discoverCharacteristics(peripheralUUID, serviceUUID, characteristicUUIDs) {
        const handle = this.uuidToHandle.get(peripheralUUID);
        const gatt = this.gatts.get(handle);
        if (gatt) {
            gatt.discoverCharacteristics(serviceUUID, characteristicUUIDs || []);
        }
    }
    read(peripheralUUID, serviceUUID, characteristicUUID) {
        const handle = this.uuidToHandle.get(peripheralUUID);
        const gatt = this.gatts.get(handle);
        if (gatt) {
            gatt.read(serviceUUID, characteristicUUID);
        }
    }
    write(peripheralUUID, serviceUUID, characteristicUUID, data, withoutResponse) {
        const handle = this.uuidToHandle.get(peripheralUUID);
        const gatt = this.gatts.get(handle);
        if (gatt) {
            gatt.write(serviceUUID, characteristicUUID, data, withoutResponse);
        }
    }
    broadcast(peripheralUUID, serviceUUID, characteristicUUID, broadcast) {
        const handle = this.uuidToHandle.get(peripheralUUID);
        const gatt = this.gatts.get(handle);
        if (gatt) {
            gatt.broadcast(serviceUUID, characteristicUUID, broadcast);
        }
    }
    notify(peripheralUUID, serviceUUID, characteristicUUID, notify) {
        const handle = this.uuidToHandle.get(peripheralUUID);
        const gatt = this.gatts.get(handle);
        if (gatt) {
            gatt.notify(serviceUUID, characteristicUUID, notify);
        }
    }
    discoverDescriptors(peripheralUUID, serviceUUID, characteristicUUID) {
        const handle = this.uuidToHandle.get(peripheralUUID);
        const gatt = this.gatts.get(handle);
        if (gatt) {
            gatt.discoverDescriptors(serviceUUID, characteristicUUID);
        }
    }
    readValue(peripheralUUID, serviceUUID, characteristicUUID, descriptorUUID) {
        const handle = this.uuidToHandle.get(peripheralUUID);
        const gatt = this.gatts.get(handle);
        if (gatt) {
            gatt.readValue(serviceUUID, characteristicUUID, descriptorUUID);
        }
    }
    writeValue(peripheralUUID, serviceUUID, characteristicUUID, descriptorUUID, data) {
        const handle = this.uuidToHandle.get(peripheralUUID);
        const gatt = this.gatts.get(handle);
        if (gatt) {
            gatt.writeValue(serviceUUID, characteristicUUID, descriptorUUID, data);
        }
    }
    readHandle(peripheralUUID, attHandle) {
        const handle = this.uuidToHandle.get(peripheralUUID);
        const gatt = this.gatts.get(handle);
        if (gatt) {
            gatt.readHandle(attHandle);
        }
    }
    writeHandle(peripheralUUID, attHandle, data, withoutResponse) {
        const handle = this.uuidToHandle.get(peripheralUUID);
        const gatt = this.gatts.get(handle);
        if (gatt) {
            gatt.writeHandle(attHandle, data, withoutResponse);
        }
    }
}
exports.HciBindings = HciBindings;
//# sourceMappingURL=bindings.js.map