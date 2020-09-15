import { EventEmitter } from 'events';

import { GattCharacteristic, GattDescriptor, GattService, NobleBindings } from './Bindings';
import { Characteristic } from './Characteristic';
import { Descriptor } from './Descriptor';
import { Peripheral } from './Peripheral';
import { Service } from './Service';

export class Noble extends EventEmitter {
	public address: string = 'unknown';
	public state: string = 'unknown';

	private initialized: boolean = false;
	private bindings: NobleBindings = null;
	private allowDuplicates: boolean = false;

	private discoveredPeripheralUUIDs: Set<string> = new Set();
	private peripherals: Map<string, Peripheral> = new Map();

	public constructor(bindings: NobleBindings) {
		super();

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

	private onStateChange = (state: string) => {
		this.state = state;
		this.emit('stateChange', state);
	};

	private onAddressChange = (address: string) => {
		this.address = address;
	};

	public async startScanning(serviceUUIDs: string[], allowDuplicates?: boolean) {
		await this.init();

		this.discoveredPeripheralUUIDs = new Set();
		this.allowDuplicates = allowDuplicates;

		this.bindings.startScanning(serviceUUIDs, allowDuplicates);

		return new Promise<void>((resolve) => this.once('scanStart', () => resolve()));
	}

	private onScanStart = () => {
		this.emit('scanStart');
	};

	public async stopScanning() {
		if (!this.bindings || !this.initialized) {
			return;
		}

		this.bindings.stopScanning();

		return new Promise<void>((resolve) => this.once('scanStop', () => resolve()));
	}

	private onScanStop = () => {
		this.emit('scanStop');
	};

	private onDiscover = (
		uuid: string,
		address: string,
		addressType: string,
		connectable: boolean,
		advertisement: any,
		rssi: number
	) => {
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
	};

	public connect(peripheralUUID: string, requestMtu?: number) {
		this.bindings.connect(peripheralUUID, requestMtu);
	}

	private onConnect = (peripheralUUID: string, error?: Error) => {
		const peripheral = this.peripherals.get(peripheralUUID);

		if (peripheral) {
			peripheral.state = error ? 'error' : 'connected';
			peripheral.emit('connect', error);
		}
	};

	public disconnect(peripheralUUID: string) {
		this.bindings.disconnect(peripheralUUID);
	}

	public onDisconnect(peripheralUUID: string, reason: number) {
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

	public discoverServices(peripheralUUID: string, uuids: string[]) {
		this.bindings.discoverServices(peripheralUUID, uuids);
	}

	private onServicesDiscover(peripheralUUID: string, discoveredServices: GattService[]) {
		const peripheral = this.peripherals.get(peripheralUUID);

		if (peripheral) {
			peripheral.emit('servicesDiscover', peripheral, discoveredServices);
		}
	}

	private onServicesDiscovered(peripheralUUID: string, services: GattService[]) {
		const peripheral = this.peripherals.get(peripheralUUID);
		if (!peripheral) {
			return;
		}

		const newServices: Map<string, Service> = new Map();
		for (const service of services) {
			newServices.set(service.uuid, new Service(this, peripheralUUID, service.uuid));
		}
		peripheral.services = newServices;

		peripheral.emit('servicesDiscovered', newServices);
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

	public discoverCharacteristics(peripheralUUID: string, serviceUUID: string, characteristicUUIDs: string[]) {
		this.bindings.discoverCharacteristics(peripheralUUID, serviceUUID, characteristicUUIDs);
	}

	private onCharacteristicsDiscover(
		peripheralUUID: string,
		serviceUUID: string,
		discoveredCharacteristics: GattCharacteristic[]
	) {
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

	private onCharacteristicsDiscovered(
		peripheralUUID: string,
		serviceUUID: string,
		characteristics: GattCharacteristic[]
	) {
		const peripheral = this.peripherals.get(peripheralUUID);
		if (!peripheral) {
			return;
		}

		const service = peripheral.services.get(serviceUUID);
		if (!service) {
			return;
		}

		const newCharacteristics: Map<string, Characteristic> = new Map();
		for (const characteristic of characteristics) {
			const char = new Characteristic(
				this,
				peripheralUUID,
				serviceUUID,
				characteristic.uuid,
				characteristic.properties
			);

			newCharacteristics.set(characteristic.uuid, char);
		}
		service.characteristics = newCharacteristics;

		service.emit('characteristicsDiscovered', newCharacteristics);
	}

	public read(peripheralUUID: string, serviceUUID: string, characteristicUUID: string) {
		this.bindings.read(peripheralUUID, serviceUUID, characteristicUUID);
	}

	private onRead(peripheralUUID: string, serviceUUID: string, characteristicUUID: string, data: any) {
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
		discoveredDescriptors: GattDescriptor[]
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

		characteristic.emit('descriptorsDiscover', discoveredDescriptors);
	}

	private onDescriptorsDiscovered(
		peripheralUUID: string,
		serviceUUID: string,
		characteristicUUID: string,
		descriptors: GattDescriptor[]
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
		for (const descriptor of descriptors) {
			const desc = new Descriptor(this, peripheralUUID, serviceUUID, characteristicUUID, descriptor.uuid);
			newDescriptors.set(descriptor.uuid, desc);
		}
		characteristic.descriptors = newDescriptors;

		characteristic.emit('descriptorsDiscovered', newDescriptors);
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
