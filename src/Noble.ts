import { EventEmitter } from 'events';

import { Characteristic } from './Characteristic';
import { Descriptor } from './Descriptor';
import { Peripheral } from './Peripheral';
import { Service } from './Service';

export class Noble extends EventEmitter {
	public address: string = 'unknown';
	public state: string = 'unknown';

	private initialized: boolean = false;
	private bindings: any = null;
	private allowDuplicates: boolean = false;

	private discoveredPeripheralUUIDs: Set<string> = new Set();
	private peripherals: Map<string, Peripheral> = new Map();

	public constructor(bindings: any) {
		super();

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

	public async init(timeoutInSeconds?: number) {
		if (!this.initialized) {
			this.initialized = true;
			this.bindings.init();
		}

		if (this.state === 'poweredOn') {
			return;
		}

		const timeout = new Promise<void>((_, reject) =>
			setTimeout(() => reject('Initializing timed out'), timeoutInSeconds * 1000)
		);
		const doInit = new Promise<void>((resolve) => {
			const callback = (state: string) => {
				if (state === 'poweredOn') {
					this.off('stateChange', callback);
					resolve();
				}
			};
			this.on('stateChange', callback);
		});

		return Promise.race([timeout, doInit]);
	}

	private onStateChange(state: string) {
		this.state = state;
		this.emit('stateChange', state);
	}

	private onAddressChange(address: string) {
		this.address = address;
	}

	public async startScanning(serviceUUIDs: string[], allowDuplicates?: boolean) {
		await this.init();

		this.discoveredPeripheralUUIDs = new Set();
		this.allowDuplicates = allowDuplicates;

		this.bindings.startScanning(serviceUUIDs, allowDuplicates);

		return new Promise<void>((resolve) => this.once('scanStart', () => resolve()));
	}

	private onScanStart() {
		this.emit('scanStart');
	}

	public async stopScanning() {
		if (!this.bindings || !this.initialized) {
			return;
		}

		this.bindings.stopScanning();

		return new Promise<void>((resolve) => this.once('scanStop', () => resolve()));
	}

	private onScanStop() {
		this.emit('scanStop');
	}

	private onDiscover(
		uuid: string,
		address: string,
		addressType: string,
		connectable: boolean,
		advertisement: any,
		rssi: number
	) {
		let peripheral = this.peripherals.get(uuid);

		if (!peripheral) {
			peripheral = new Peripheral(this, uuid, address, addressType, connectable, advertisement, rssi);
			this.peripherals.set(uuid, peripheral);
		} else {
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

	public connect(peripheralUUID: string, requestMtu?: number) {
		this.bindings.connect(peripheralUUID, requestMtu);
	}

	private onConnect(peripheralUUID: string, error: any) {
		const peripheral = this.peripherals.get(peripheralUUID);

		if (peripheral) {
			peripheral.state = error ? 'error' : 'connected';
			peripheral.emit('connect', error);
		}
	}

	public disconnect(peripheralUUID: string) {
		this.bindings.disconnect(peripheralUUID);
	}

	public onDisconnect(peripheralUUID: string, reason: any) {
		const peripheral = this.peripherals.get(peripheralUUID);

		if (peripheral) {
			peripheral.state = 'disconnected';
			peripheral.emit('disconnect', reason);
		}
	}

	public updateRSSI(peripheralUUID: string) {
		this.bindings.updateRssi(peripheralUUID);
	}

	private onRssiUpdate(peripheralUUID: string, rssi: number) {
		const peripheral = this.peripherals.get(peripheralUUID);

		if (peripheral) {
			peripheral.rssi = rssi;
			peripheral.emit('rssiUpdate', rssi);
		}
	}

	private onServicesDiscovered(peripheralUUID: string, services: any[]) {
		const peripheral = this.peripherals.get(peripheralUUID);

		if (peripheral) {
			peripheral.emit('servicesDiscovered', peripheral, services);
		}
	}

	public discoverServices(peripheralUUID: string, uuids: string[]) {
		this.bindings.discoverServices(peripheralUUID, uuids);
	}

	private onServicesDiscover(peripheralUUID: string, serviceUUIDs: string[]) {
		const peripheral = this.peripherals.get(peripheralUUID);
		if (!peripheral) {
			return;
		}

		const newServices: Map<string, Service> = new Map();
		for (const serviceUUID of serviceUUIDs) {
			newServices.set(serviceUUID, new Service(this, peripheralUUID, serviceUUID));
		}
		peripheral.services = newServices;

		peripheral.emit('servicesDiscover', newServices);
	}

	public discoverIncludedServices(peripheralUUID: string, serviceUUID: string, serviceUUIDs: string[]) {
		this.bindings.discoverIncludedServices(peripheralUUID, serviceUUID, serviceUUIDs);
	}

	private onIncludedServicesDiscover(peripheralUUID: string, serviceUUID: string, includedServiceUUIDs: string[]) {
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

	private onCharacteristicsDiscovered(peripheralUUID: string, serviceUUID: string, characteristics: any[]) {
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

	public discoverCharacteristics(peripheralUUID: string, serviceUUID: string, characteristicUUIDs: string[]) {
		this.bindings.discoverCharacteristics(peripheralUUID, serviceUUID, characteristicUUIDs);
	}

	private onCharacteristicsDiscover(peripheralUUID: string, serviceUUID: string, characteristics: any[]) {
		const peripheral = this.peripherals.get(peripheralUUID);
		if (!peripheral) {
			return;
		}

		const service = peripheral.services.get(serviceUUID);
		if (!service) {
			return;
		}

		const newCharacteristics: Map<string, Characteristic> = new Map();
		for (const rawCharacteristic of characteristics) {
			const characteristicUUID = rawCharacteristic.uuid;

			const characteristic = new Characteristic(
				this,
				peripheralUUID,
				serviceUUID,
				characteristicUUID,
				rawCharacteristic.properties
			);

			newCharacteristics.set(characteristicUUID, characteristic);
		}
		service.characteristics = newCharacteristics;

		service.emit('characteristicsDiscover', newCharacteristics);
	}

	public read(peripheralUUID: string, serviceUUID: string, characteristicUUID: string) {
		this.bindings.read(peripheralUUID, serviceUUID, characteristicUUID);
	}

	private onRead(
		peripheralUUID: string,
		serviceUUID: string,
		characteristicUUID: string,
		data: any,
		isNotification: boolean
	) {
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

	public write(
		peripheralUUID: string,
		serviceUUID: string,
		characteristicUUID: string,
		data: any,
		withoutResponse: boolean
	) {
		this.bindings.write(peripheralUUID, serviceUUID, characteristicUUID, data, withoutResponse);
	}

	private onWrite(peripheralUUID: string, serviceUUID: string, characteristicUUID: string) {
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

	public broadcast(peripheralUUID: string, serviceUUID: string, characteristicUUID: string, broadcast: any) {
		this.bindings.broadcast(peripheralUUID, serviceUUID, characteristicUUID, broadcast);
	}

	private onBroadcast(peripheralUUID: string, serviceUUID: string, characteristicUUID: string, state: any) {
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

	public notify(peripheralUUID: string, serviceUUID: string, characteristicUUID: string, notify: boolean) {
		this.bindings.notify(peripheralUUID, serviceUUID, characteristicUUID, notify);
	}

	private onNotify(peripheralUUID: string, serviceUUID: string, characteristicUUID: string, state: boolean) {
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

	public discoverDescriptors(peripheralUUID: string, serviceUUID: string, characteristicUUID: string) {
		this.bindings.discoverDescriptors(peripheralUUID, serviceUUID, characteristicUUID);
	}

	private onDescriptorsDiscover(
		peripheralUUID: string,
		serviceUUID: string,
		characteristicUUID: string,
		descriptorUUIDs: string
	) {
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

		const newDescriptors: Map<string, Descriptor> = new Map();
		for (const descriptorUUID of descriptorUUIDs) {
			const descriptor = new Descriptor(this, peripheralUUID, serviceUUID, characteristicUUID, descriptorUUID);
			newDescriptors.set(descriptorUUID, descriptor);
		}
		characteristic.descriptors = newDescriptors;

		characteristic.emit('descriptorsDiscover', newDescriptors);
	}

	public readValue(peripheralUUID: string, serviceUUID: string, characteristicUUID: string, descriptorUUID: string) {
		this.bindings.readValue(peripheralUUID, serviceUUID, characteristicUUID, descriptorUUID);
	}

	private onValueRead(
		peripheralUUID: string,
		serviceUUID: string,
		characteristicUUID: string,
		descriptorUUID: string,
		data: any
	) {
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

	public writeValue(
		peripheralUUID: string,
		serviceUUID: string,
		characteristicUUID: string,
		descriptorUUID: string,
		data: any
	) {
		this.bindings.writeValue(peripheralUUID, serviceUUID, characteristicUUID, descriptorUUID, data);
	}

	private onValueWrite(
		peripheralUUID: string,
		serviceUUID: string,
		characteristicUUID: string,
		descriptorUUID: string
	) {
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

	public readHandle(peripheralUUID: string, handle: number) {
		this.bindings.readHandle(peripheralUUID, handle);
	}

	private onHandleRead(peripheralUUID: string, handle: number, data: any) {
		const peripheral = this.peripherals.get(peripheralUUID);

		if (peripheral) {
			peripheral.emit(`handleRead${handle}`, data);
		}
	}

	public writeHandle(peripheralUUID: string, handle: number, data: any, withoutResponse: boolean) {
		this.bindings.writeHandle(peripheralUUID, handle, data, withoutResponse);
	}

	private onHandleWrite(peripheralUUID: string, handle: number) {
		const peripheral = this.peripherals.get(peripheralUUID);

		if (peripheral) {
			peripheral.emit(`handleWrite${handle}`);
		}
	}

	private onHandleNotify(peripheralUUID: string, handle: number, data: any) {
		const peripheral = this.peripherals.get(peripheralUUID);

		if (peripheral) {
			peripheral.emit('handleNotify', handle, data);
		}
	}

	private onMtu(peripheralUUID: string, mtu: number) {
		const peripheral = this.peripherals.get(peripheralUUID);

		if (peripheral) {
			peripheral.mtu = mtu;
		}
	}
}
