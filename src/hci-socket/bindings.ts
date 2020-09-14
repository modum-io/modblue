import { EventEmitter } from 'events';

import { AclStream } from './acl-stream';
import { Gap } from './gap';
import Gatt from './gatt';
import Hci from './hci';
import { Signaling } from './signaling';

export class NobleBindings extends EventEmitter {
	private state: string;
	private addresses: Map<string, any>;
	private addressTypes: Map<string, any>;
	private connectable: Map<string, any>;
	private requestedMtu: Map<string, number>;
	private scanServiceUUIDs: string[];

	private pendingConnectionUUID: string;
	private connectionQueue: string[];

	private handles: Map<any, any>;
	private gatts: Map<any, any>;
	private aclStreams: Map<any, AclStream>;
	private signalings: Map<any, Signaling>;

	private hci: any;
	private gap: Gap;

	public constructor() {
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

		this.hci = new Hci();
		this.gap = new Gap(this.hci);
	}

	public startScanning(serviceUUIDs: string[], allowDuplicates: boolean) {
		this.scanServiceUUIDs = serviceUUIDs || [];
		this.gap.startScanning(allowDuplicates);
	}

	public stopScanning() {
		this.gap.stopScanning();
	}

	public connect(peripheralUUID: string, requestMtu?: number) {
		const address = this.addresses.get(peripheralUUID);
		const addressType = this.addressTypes.get(peripheralUUID);

		if (requestMtu) {
			this.requestedMtu.set(peripheralUUID, requestMtu);
		} else {
			this.requestedMtu.delete(peripheralUUID);
		}

		if (!this.pendingConnectionUUID) {
			this.pendingConnectionUUID = peripheralUUID;

			this.hci.createLeConn(address, addressType);
		} else {
			this.connectionQueue.push(peripheralUUID);
		}
	}

	public disconnect(peripheralUUID: string) {
		this.hci.disconnect(this.handles.get(peripheralUUID));
	}

	public updateRssi(peripheralUUID: string) {
		this.hci.readRssi(this.handles.get(peripheralUUID));
	}

	public init() {
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

	private onSigInt() {
		const sigIntListeners = process.listeners('SIGINT');

		if (sigIntListeners[sigIntListeners.length - 1] === this.onSigInt) {
			// we are the last listener, so exit
			// this will trigger onExit, and clean up
			process.exit(1);
		}
	}

	private onExit() {
		this.stopScanning();

		for (const handle of this.aclStreams.keys()) {
			this.hci.disconnect(handle);
		}
	}

	private onStateChange(state: string) {
		if (this.state === state) {
			return;
		}
		this.state = state;

		if (state === 'unauthorized') {
			console.log('noble warning: adapter state unauthorized, please run as root or with sudo');
			console.log('               or see README for information on running without root/sudo:');
			console.log('               https://github.com/sandeepmistry/noble#running-on-linux');
		} else if (state === 'unsupported') {
			console.log('noble warning: adapter does not support Bluetooth Low Energy (BLE, Bluetooth Smart).');
			console.log('               Try to run with environment variable:');
			console.log('               [sudo] NOBLE_HCI_DEVICE_ID=x node ...');
		}

		this.emit('stateChange', state);
	}

	private onAddressChange(address: string) {
		this.emit('addressChange', address);
	}

	private onScanStart(filterDuplicates: boolean) {
		this.emit('scanStart', filterDuplicates);
	}

	private onScanStop() {
		this.emit('scanStop');
	}

	private onDiscover(
		status: number,
		address: string,
		addressType: string,
		connectable: boolean,
		advertisement: any,
		rssi: number
	) {
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

	private onLeConnComplete(
		status: number,
		handle: number,
		role: number,
		addressType: string,
		address: string,
		interval: number,
		latency: number,
		supervisionTimeout: number,
		masterClockAccuracy: number
	) {
		if (role !== 0) {
			// not master, ignore
			return;
		}
		let uuid = null;

		let error = null;

		if (status === 0) {
			uuid = address.split(':').join('').toLowerCase();

			const aclStream = new AclStream(this.hci, handle, this.hci.addressType, this.hci.address, addressType, address);
			const gatt = new Gatt(address, aclStream);
			const signaling = new Signaling(handle, aclStream);

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
		} else {
			uuid = this.pendingConnectionUUID;
			let statusMessage = Hci.STATUS_MAPPER[status] || 'HCI Error: Unknown';
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
		} else {
			this.pendingConnectionUUID = null;
		}
	}

	private onLeConnUpdateComplete(handle: number, interval: number, latency: number, supervisionTimeout: number) {
		// NO-OP
	}

	private onDisconnComplete(handle: number, reason: string) {
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

	private onEncryptChange(handle: number, encrypt: any) {
		const aclStream = this.aclStreams.get(handle);

		if (aclStream) {
			aclStream.pushEncrypt(encrypt);
		}
	}

	private onMtu(address: string, mtu: number) {
		const uuid = address.split(':').join('').toLowerCase();
		this.emit('onMtu', uuid, mtu);
	}

	private onRssiRead(handle: number, rssi: number) {
		this.emit('rssiUpdate', this.handles.get(handle), rssi);
	}

	private onAclDataPkt(handle: number, cid: any, data: Buffer) {
		const aclStream = this.aclStreams.get(handle);

		if (aclStream) {
			aclStream.push(cid, data);
		}
	}

	public discoverServices(peripheralUUID: string, uuids: string[]) {
		const handle = this.handles.get(peripheralUUID);
		const gatt = this.gatts.get(handle);

		if (gatt) {
			gatt.discoverServices(uuids || []);
		}
	}

	private onServicesDiscovered(address: string, serviceUUIDs: string[]) {
		const uuid = address.split(':').join('').toLowerCase();
		this.emit('servicesDiscover', uuid, serviceUUIDs);
	}

	private onServicesDiscoveredEX(address: string, services: any[]) {
		const uuid = address.split(':').join('').toLowerCase();
		this.emit('servicesDiscovered', uuid, services);
	}

	public discoverIncludedServices(peripheralUUID: string, serviceUUID: string, serviceUUIDs: string[]) {
		const handle = this.handles.get(peripheralUUID);
		const gatt = this.gatts.get(handle);

		if (gatt) {
			gatt.discoverIncludedServices(serviceUUID, serviceUUIDs || []);
		}
	}

	private onIncludedServicesDiscovered(address: string, serviceUUID: string, includedServiceUUIDs: string[]) {
		const uuid = address.split(':').join('').toLowerCase();
		this.emit('includedServicesDiscover', uuid, serviceUUID, includedServiceUUIDs);
	}

	public discoverCharacteristics(peripheralUUID: string, serviceUUID: string, characteristicUUIDs: string) {
		const handle = this.handles.get(peripheralUUID);
		const gatt = this.gatts.get(handle);

		if (gatt) {
			gatt.discoverCharacteristics(serviceUUID, characteristicUUIDs || []);
		}
	}

	private onCharacteristicsDiscovered(address: string, serviceUUID: string, characteristics: any) {
		const uuid = address.split(':').join('').toLowerCase();
		this.emit('characteristicsDiscover', uuid, serviceUUID, characteristics);
	}

	private onCharacteristicsDiscoveredEX(address: string, serviceUUID: string, characteristics: any) {
		const uuid = address.split(':').join('').toLowerCase();
		this.emit('characteristicsDiscovered', uuid, serviceUUID, characteristics);
	}

	public read(peripheralUUID: string, serviceUUID: string, characteristicUUID: string) {
		const handle = this.handles.get(peripheralUUID);
		const gatt = this.gatts.get(handle);

		if (gatt) {
			gatt.read(serviceUUID, characteristicUUID);
		}
	}

	private onRead(address: string, serviceUUID: string, characteristicUUID: string, data: Buffer) {
		const uuid = address.split(':').join('').toLowerCase();
		this.emit('read', uuid, serviceUUID, characteristicUUID, data, false);
	}

	public write(
		peripheralUUID: string,
		serviceUUID: string,
		characteristicUUID: string,
		data: Buffer,
		withoutResponse: boolean
	) {
		const handle = this.handles.get(peripheralUUID);
		const gatt = this.gatts.get(handle);

		if (gatt) {
			gatt.write(serviceUUID, characteristicUUID, data, withoutResponse);
		}
	}

	private onWrite(address: string, serviceUUID: string, characteristicUUID: string) {
		const uuid = address.split(':').join('').toLowerCase();
		this.emit('write', uuid, serviceUUID, characteristicUUID);
	}

	public broadcast(peripheralUUID: string, serviceUUID: string, characteristicUUID: string, broadcast: boolean) {
		const handle = this.handles.get(peripheralUUID);
		const gatt = this.gatts.get(handle);

		if (gatt) {
			gatt.broadcast(serviceUUID, characteristicUUID, broadcast);
		}
	}

	private onBroadcast(address: string, serviceUUID: string, characteristicUUID: string, state: boolean) {
		const uuid = address.split(':').join('').toLowerCase();

		this.emit('broadcast', uuid, serviceUUID, characteristicUUID, state);
	}

	public notify(peripheralUUID: string, serviceUUID: string, characteristicUUID: string, notify: boolean) {
		const handle = this.handles.get(peripheralUUID);
		const gatt = this.gatts.get(handle);

		if (gatt) {
			gatt.notify(serviceUUID, characteristicUUID, notify);
		}
	}

	private onNotify(address: string, serviceUUID: string, characteristicUUID: string, state: boolean) {
		const uuid = address.split(':').join('').toLowerCase();
		this.emit('notify', uuid, serviceUUID, characteristicUUID, state);
	}

	private onNotification(address: string, serviceUUID: string, characteristicUUID: string, data: Buffer) {
		const uuid = address.split(':').join('').toLowerCase();
		this.emit('read', uuid, serviceUUID, characteristicUUID, data, true);
	}

	public discoverDescriptors(peripheralUUID: string, serviceUUID: string, characteristicUUID: string) {
		const handle = this.handles.get(peripheralUUID);
		const gatt = this.gatts.get(handle);

		if (gatt) {
			gatt.discoverDescriptors(serviceUUID, characteristicUUID);
		}
	}

	private onDescriptorsDiscovered(
		address: string,
		serviceUUID: string,
		characteristicUUID: string,
		descriptorUUIDs: string[]
	) {
		const uuid = address.split(':').join('').toLowerCase();
		this.emit('descriptorsDiscover', uuid, serviceUUID, characteristicUUID, descriptorUUIDs);
	}

	public readValue(peripheralUUID: string, serviceUUID: string, characteristicUUID: string, descriptorUUID: string) {
		const handle = this.handles.get(peripheralUUID);
		const gatt = this.gatts.get(handle);

		if (gatt) {
			gatt.readValue(serviceUUID, characteristicUUID, descriptorUUID);
		}
	}

	private onValueRead(
		address: string,
		serviceUUID: string,
		characteristicUUID: string,
		descriptorUUID: string,
		data: Buffer
	) {
		const uuid = address.split(':').join('').toLowerCase();
		this.emit('valueRead', uuid, serviceUUID, characteristicUUID, descriptorUUID, data);
	}

	public writeValue(
		peripheralUUID: string,
		serviceUUID: string,
		characteristicUUID: string,
		descriptorUUID: string,
		data: Buffer
	) {
		const handle = this.handles.get(peripheralUUID);
		const gatt = this.gatts.get(handle);

		if (gatt) {
			gatt.writeValue(serviceUUID, characteristicUUID, descriptorUUID, data);
		}
	}

	private onValueWrite(address: string, serviceUUID: string, characteristicUUID: string, descriptorUUID: string) {
		const uuid = address.split(':').join('').toLowerCase();
		this.emit('valueWrite', uuid, serviceUUID, characteristicUUID, descriptorUUID);
	}

	public readHandle(peripheralUUID: string, attHandle: number) {
		const handle = this.handles.get(peripheralUUID);
		const gatt = this.gatts.get(handle);

		if (gatt) {
			gatt.readHandle(attHandle);
		}
	}

	private onHandleRead(address: string, handle: number, data: Buffer) {
		const uuid = address.split(':').join('').toLowerCase();
		this.emit('handleRead', uuid, handle, data);
	}

	public writeHandle(peripheralUUID: string, attHandle: number, data: Buffer, withoutResponse: boolean) {
		const handle = this.handles.get(peripheralUUID);
		const gatt = this.gatts.get(handle);

		if (gatt) {
			gatt.writeHandle(attHandle, data, withoutResponse);
		}
	}

	private onHandleWrite(address: string, handle: number) {
		const uuid = address.split(':').join('').toLowerCase();

		this.emit('handleWrite', uuid, handle);
	}

	private onHandleNotify(address: string, handle: number, data: Buffer) {
		const uuid = address.split(':').join('').toLowerCase();

		this.emit('handleNotify', uuid, handle, data);
	}

	private onConnectionParameterUpdateRequest(
		handle: number,
		minInterval: number,
		maxInterval: number,
		latency: number,
		supervisionTimeout: number
	) {
		this.hci.connUpdateLe(handle, minInterval, maxInterval, latency, supervisionTimeout);
	}
}
