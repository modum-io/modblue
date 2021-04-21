/* eslint-disable @typescript-eslint/no-var-requires */
import EventEmitter from 'events';

import { AddressType } from '../../models';

import * as rt from './rt-utils';

declare global {
	let Windows: any;
}

try {
	// Note the load order here is important for cross-namespace dependencies.
	rt.using(require('../../../build/Release/win-foundation.node'), 'Windows.Foundation');
	rt.using(require('../../../build/Release/win-storage.streams.node'), 'Windows.Storage.Streams');
	rt.using(require('../../../build/Release/win-dev.enum.node'), 'Windows.Devices.Enumeration');
	rt.using(require('../../../build/Release/win-dev.ble.gap.node'), 'Windows.Devices.Bluetooth.GenericAttributeProfile');
	rt.using(require('../../../build/Release/win-dev.ble.node'), 'Windows.Devices.Bluetooth');
	rt.using(require('../../../build/Release/win-dev.ble.adv.node'), 'Windows.Devices.Bluetooth.Advertisement');
	rt.using(require('../../../build/Release/win-dev.radios.node'), 'Windows.Devices.Radios');
} catch {
	// NO-OP
	(global as any).Windows = null;
}

const BluetoothLEDevice = Windows?.Devices.Bluetooth.BluetoothLEDevice;
const BluetoothCacheMode = Windows?.Devices.Bluetooth.BluetoothCacheMode;
const BluetoothUuidHelper = Windows?.Devices.Bluetooth.BluetoothUuidHelper;
const BluetoothConnectionStatus = Windows?.Devices.Bluetooth.BluetoothConnectionStatus;

const BluetoothLEAdvertisementWatcher = Windows?.Devices.Bluetooth.Advertisement.BluetoothLEAdvertisementWatcher;
const BluetoothLEScanningMode = Windows?.Devices.Bluetooth.Advertisement.BluetoothLEScanningMode;
const BluetoothLEAdvertisementType = Windows?.Devices.Bluetooth.Advertisement.BluetoothLEAdvertisementType;
const BluetoothLEAdvertisementDataTypes = Windows?.Devices.Bluetooth.Advertisement.BluetoothLEAdvertisementDataTypes;
const BluetoothLEAdvertisementWatcherStatus =
	Windows?.Devices.Bluetooth.Advertisement.BluetoothLEAdvertisementWatcherStatus;

const GattCharacteristicProperties = Windows?.Devices.Bluetooth.GenericAttributeProfile.GattCharacteristicProperties;
// const GattDeviceService = Windows?.Devices.Bluetooth.GenericAttributeProfile.GattDeviceService;
// const GattServiceUuids = Windows?.Devices.Bluetooth.GenericAttributeProfile.GattServiceUuids;
const GattCommunicationStatus = Windows?.Devices.Bluetooth.GenericAttributeProfile.GattCommunicationStatus;
const GattClientCharacteristicConfigurationDescriptorValue =
	Windows?.Devices.Bluetooth.GenericAttributeProfile.GattClientCharacteristicConfigurationDescriptorValue;

const Radio = Windows?.Devices.Radios.Radio;
const RadioKind = Windows?.Devices.Radios.RadioKind;
const RadioState = Windows?.Devices.Radios.RadioState;

const DataReader = Windows?.Storage.Streams.DataReader;

export interface Radio extends EventEmitter {
	kind: string;
	name: string;
	state: string;
}

interface Service extends rt.Disposable {
	uuid: string;
}

interface ServiceCommunicationResult extends CommunicationResult {
	services: Service[];
}

interface Characteristic extends rt.Disposable {
	uuid: string;
	characteristicProperties: any;
}

interface CharacteristicCommunicationResult extends CommunicationResult {
	characteristics: Characteristic[];
	value?: any;
}

interface Descriptor extends rt.Disposable {
	uuid: string;
}

interface DescriptorCommunicationResult extends CommunicationResult {
	descriptors: Descriptor[];
	value?: any;
}

interface DeviceRecord {
	name: string;
	connectable: boolean;
	address: number;
	addressType: AddressType;
	formattedAddress: string;
	serviceUuids: string[];
	txPowerLevel: number;
	manufacturerData?: any;

	device: any;
	serviceMap: { [key: string]: any };
	characteristicMap: { [key: string]: any };
	descriptorMap: { [key: string]: any };
}

interface AdvertisementEvent {
	bluetoothAddress: number;
	advertisementType: string;
	advertisement: {
		localName: string;
		serviceUuids: string[];
		dataSections: {
			dataType: string;
			data: Buffer;
		}[];
		manufacturerData: any;
	};
	rawSignalStrengthInDBm: number;
}

type Listener = (source: any, event: any) => void;

export class NobleBindings extends EventEmitter {
	private _radio: Radio = null;
	private _radioState = 'unknown';
	private _deviceMap: { [key: string]: DeviceRecord } = {};
	private _devicesListeners: { [key: string]: { [key: string]: Listener } } = {};
	private _acceptOnlyScanResponse = false;
	private _advertisementWatcher: any;
	private _filterAdvertisementServiceUuids: string[];
	private _allowAdvertisementDuplicates: boolean;

	public static async getAdapterList(): Promise<Radio[]> {
		const radios = rt.toArray<Radio>((await rt.promisify(Radio.getRadiosAsync)()) as Radio[]);
		return radios.filter((radio) => radio.kind === RadioKind.bluetooth);
	}

	public constructor(radio: Radio) {
		super();

		this._radio = radio;
	}

	public init(): void {
		this._advertisementWatcher = new BluetoothLEAdvertisementWatcher();
		this._advertisementWatcher.scanningMode = BluetoothLEScanningMode.active;
		this._advertisementWatcher.on('received', this._onAdvertisementWatcherReceived);
		this._advertisementWatcher.on('stopped', this._onAdvertisementWatcherStopped);

		this._radio.on('stateChanged', () => {
			this._updateRadioState();
		});
		this._updateRadioState();
	}

	public startScanning(serviceUuids?: string[], allowDuplicates?: boolean): void {
		if (!(serviceUuids && serviceUuids.length > 0)) {
			serviceUuids = null;
		}
		allowDuplicates = !!allowDuplicates;

		this._filterAdvertisementServiceUuids = serviceUuids;
		this._allowAdvertisementDuplicates = allowDuplicates;

		if (this._advertisementWatcher.status === BluetoothLEAdvertisementWatcherStatus.started) {
			return;
		}

		this._advertisementWatcher.start();
		rt.keepAlive(true);
	}

	public stopScanning(): void {
		if (this._advertisementWatcher.status === BluetoothLEAdvertisementWatcherStatus.started) {
			this._advertisementWatcher.stop();
			rt.keepAlive(false);
		}
	}

	public connect(deviceUuid: string): void {
		const deviceRecord = this._deviceMap[deviceUuid];
		if (!deviceRecord) {
			throw new Error('Invalid or unknown device UUID: ' + deviceUuid);
		}

		if (!deviceRecord.connectable) {
			throw new Error('Device is not connectable: ' + deviceRecord.formattedAddress);
		}

		rt.promisify(BluetoothLEDevice.fromBluetoothAddressAsync)(deviceRecord.address)
			.then((device: rt.Disposable) => {
				if (device) {
					deviceRecord.device = rt.trackDisposable(deviceUuid, device);

					deviceRecord.device.on('connectionStatusChanged', this._onConnectionStatusChanged);

					this.emit('connect', deviceUuid, null);
					rt.keepAlive(true);
				} else {
					this.emit(
						'connect',
						deviceUuid,
						new Error('Failed to get a Bluetooth device pointer from address for device UUID: ' + deviceUuid)
					);
				}
			})
			.catch((ex) => {
				this.emit('connect', deviceUuid, ex);
			});
	}

	public disconnect(deviceUuid: string): void {
		const deviceRecord = this._deviceMap[deviceUuid];
		if (!deviceRecord) {
			throw new Error('Invalid or unknown device UUID: ' + deviceUuid);
		}

		if (deviceRecord.device) {
			deviceRecord.device.removeListener('connectionStatusChanged', this._onConnectionStatusChanged);

			deviceRecord.device = null;
			deviceRecord.serviceMap = {};
			deviceRecord.characteristicMap = {};
			deviceRecord.descriptorMap = {};

			delete this._devicesListeners[deviceUuid];

			rt.disposeAll(deviceUuid);

			rt.keepAlive(false);
			this.emit('disconnect', deviceUuid);
		}
	}

	public discoverServices(deviceUuid: string, filterServiceUuids?: string[]): void {
		if (filterServiceUuids && filterServiceUuids.length === 0) {
			filterServiceUuids = null;
		}

		const deviceRecord = this._deviceMap[deviceUuid];
		if (!deviceRecord) {
			throw new Error('Invalid or unknown device UUID: ' + deviceUuid);
		}

		const device = deviceRecord.device;
		if (!device) {
			throw new Error('Device is not connected. UUID: ' + deviceUuid);
		}

		if (filterServiceUuids && filterServiceUuids.length === 1) {
			rt.promisify(
				device.getGattServicesForUuidAsync,
				device
			)(addDashesToUuid(filterServiceUuids[0]))
				.then((result: ServiceCommunicationResult) => {
					checkCommunicationResult(deviceUuid, result);

					const services = rt.trackDisposables(deviceUuid, rt.toArray(result.services));
					const serviceUuids = services.map((s) => uuidToString(s.uuid));

					this.emit('servicesDiscover', deviceUuid, serviceUuids);
				})
				.catch((ex) => {
					this.emit('servicesDiscover', deviceUuid, ex);
				});
			return;
		}

		rt.promisify(
			device.getGattServicesAsync,
			device
		)(BluetoothCacheMode.uncached)
			.then((result: ServiceCommunicationResult) => {
				checkCommunicationResult(deviceUuid, result);

				const services = rt.trackDisposables(deviceUuid, rt.toArray(result.services));
				const serviceUuids = services.map((s) => uuidToString(s.uuid)).filter(filterUuids(filterServiceUuids));

				this.emit('servicesDiscover', deviceUuid, serviceUuids);
			})
			.catch((ex) => {
				this.emit('servicesDiscover', deviceUuid, ex);
			});
	}

	public discoverIncludedServices(deviceUuid: string, serviceUuid: string, filterServiceUuids?: string[]): void {
		if (filterServiceUuids && filterServiceUuids.length === 0) {
			filterServiceUuids = null;
		}

		this._getCachedServiceAsync(deviceUuid, serviceUuid)
			.then((service) => {
				rt.promisify(
					service.getIncludedServicesAsync,
					service
				)(BluetoothCacheMode.uncached).then((result: ServiceCommunicationResult) => {
					checkCommunicationResult(deviceUuid, result);

					const includedServices = rt.trackDisposables(deviceUuid, rt.toArray(result.services));
					const includedServiceUuids = includedServices
						.map((s) => uuidToString(s.uuid))
						.filter(filterUuids(filterServiceUuids));

					this.emit('includedServicesDiscover', deviceUuid, serviceUuid, includedServiceUuids);
				});
			})
			.catch((ex) => {
				this.emit('includedServicesDiscover', deviceUuid, serviceUuid, ex);
			});
	}

	public discoverCharacteristics(deviceUuid: string, serviceUuid: string, filterCharacteristicUuids?: string[]): void {
		if (filterCharacteristicUuids && filterCharacteristicUuids.length === 0) {
			filterCharacteristicUuids = null;
		}

		this._getCachedServiceAsync(deviceUuid, serviceUuid)
			.then((service) => {
				return rt
					.promisify(
						service.getCharacteristicsAsync,
						service
					)(BluetoothCacheMode.uncached)
					.then((result: CharacteristicCommunicationResult) => {
						checkCommunicationResult(deviceUuid, result);

						const characteristics = rt
							.toArray(result.characteristics)
							.filter((c) => {
								return filterUuids(filterCharacteristicUuids)(uuidToString(c.uuid));
							})
							.map((c) => ({
								uuid: uuidToString(c.uuid),
								properties: characteristicPropertiesToStrings(c.characteristicProperties)
							}));

						this.emit('characteristicsDiscover', deviceUuid, serviceUuid, characteristics);
					});
			})
			.catch((ex) => {
				this.emit('characteristicsDiscover', deviceUuid, serviceUuid, ex);
			});
	}

	public read(deviceUuid: string, serviceUuid: string, characteristicUuid: string): void {
		this._getCachedCharacteristicAsync(deviceUuid, serviceUuid, characteristicUuid)
			.then((characteristic) => {
				return rt
					.promisify(
						characteristic.readValueAsync,
						characteristic
					)(BluetoothCacheMode.uncached)
					.then((result: CharacteristicCommunicationResult) => {
						checkCommunicationResult(deviceUuid, result);
						const data = rt.toBuffer(result.value);
						this.emit('read', deviceUuid, serviceUuid, characteristicUuid, data, false);
					});
			})
			.catch((ex) => {
				this.emit('read', deviceUuid, serviceUuid, characteristicUuid, ex, false);
			});
	}

	public write(
		deviceUuid: string,
		serviceUuid: string,
		characteristicUuid: string,
		data: Buffer,
		withoutResponse: boolean
	): void {
		this._getCachedCharacteristicAsync(deviceUuid, serviceUuid, characteristicUuid)
			.then((characteristic) => {
				const rtBuffer = rt.fromBuffer(data);
				return rt
					.promisify(
						characteristic.writeValueWithResultAsync,
						characteristic
					)(rtBuffer)
					.then((result: CharacteristicCommunicationResult) => {
						checkCommunicationResult(deviceUuid, result);
						this.emit('write', deviceUuid, serviceUuid, characteristicUuid);
					});
			})
			.catch((ex) => {
				if (!withoutResponse) {
					this.emit('write', deviceUuid, serviceUuid, characteristicUuid, ex);
				}
			});
	}

	public notify(deviceUuid: string, serviceUuid: string, characteristicUuid: string, notify: boolean): void {
		this._getCachedCharacteristicAsync(deviceUuid, serviceUuid, characteristicUuid)
			.then((characteristic) => {
				const listenerKey = serviceUuid + '/' + characteristicUuid;
				const deviceListeners = this._devicesListeners[deviceUuid] || {};
				let listener = deviceListeners[listenerKey];

				const descriptorValue =
					characteristic.characteristicProperties & GattCharacteristicProperties.indicate
						? GattClientCharacteristicConfigurationDescriptorValue.indicate
						: GattClientCharacteristicConfigurationDescriptorValue.notify;

				if (notify) {
					if (listener) {
						// Already listening.
						this.emit('notify', deviceUuid, serviceUuid, characteristicUuid, notify);
						return;
					}

					return rt
						.promisify(
							characteristic.writeClientCharacteristicConfigurationDescriptorWithResultAsync,
							characteristic
						)(descriptorValue)
						.then((result: CharacteristicCommunicationResult) => {
							checkCommunicationResult(deviceUuid, result);

							listener = ((source: unknown, e: any) => {
								const data = rt.toBuffer(e.characteristicValue);
								this.emit('read', deviceUuid, serviceUuid, characteristicUuid, data, true);
							}).bind(this);

							characteristic.addListener('valueChanged', listener);
							deviceListeners[listenerKey] = listener;
							this.emit('notify', deviceUuid, serviceUuid, characteristicUuid, notify);
						});
				} else {
					if (!listener) {
						// Already not listening.
						this.emit('notify', deviceUuid, serviceUuid, characteristicUuid, notify);
						return;
					}

					characteristic.removeListener('valueChanged', listener);
					delete deviceListeners[listenerKey];

					return rt
						.promisify(
							characteristic.writeClientCharacteristicConfigurationDescriptorWithResultAsync,
							characteristic
						)(GattClientCharacteristicConfigurationDescriptorValue.none)
						.then((result: CharacteristicCommunicationResult) => {
							checkCommunicationResult(deviceUuid, result);

							this.emit('notify', deviceUuid, serviceUuid, characteristicUuid, notify);
						});
				}
			})
			.catch((ex) => {
				this.emit('notify', deviceUuid, serviceUuid, characteristicUuid, ex);
			});
	}

	public discoverDescriptors(deviceUuid: string, serviceUuid: string, characteristicUuid: string): void {
		this._getCachedCharacteristicAsync(deviceUuid, serviceUuid, characteristicUuid)
			.then((characteristic) => {
				return rt
					.promisify(
						characteristic.getDescriptorsAsync,
						characteristic
					)(BluetoothCacheMode.uncached)
					.then((result: DescriptorCommunicationResult) => {
						checkCommunicationResult(deviceUuid, result);

						const descriptors = rt.toArray(result.descriptors).map((d) => uuidToString(d.uuid));
						this.emit('descriptorsDiscover', deviceUuid, serviceUuid, characteristicUuid, descriptors);
					});
			})
			.catch((ex) => {
				this.emit('descriptorsDiscover', deviceUuid, serviceUuid, characteristicUuid, ex);
			});
	}

	public readValue(deviceUuid: string, serviceUuid: string, characteristicUuid: string, descriptorUuid: string): void {
		this._getCachedDescriptorAsync(deviceUuid, serviceUuid, characteristicUuid, descriptorUuid)
			.then((descriptor) => {
				return rt
					.promisify(
						descriptor.readValueAsync,
						descriptor
					)(BluetoothCacheMode.uncached)
					.then((result: DescriptorCommunicationResult) => {
						checkCommunicationResult(deviceUuid, result);
						const data = rt.toBuffer(result.value);

						this.emit('valueRead', deviceUuid, serviceUuid, characteristicUuid, descriptorUuid, data);
					});
			})
			.catch((ex) => {
				this.emit('valueRead', deviceUuid, serviceUuid, characteristicUuid, descriptorUuid, ex);
			});
	}

	public writeValue(
		deviceUuid: string,
		serviceUuid: string,
		characteristicUuid: string,
		descriptorUuid: string,
		data: Buffer
	): void {
		this._getCachedDescriptorAsync(deviceUuid, serviceUuid, characteristicUuid, descriptorUuid)
			.then((descriptor) => {
				const rtBuffer = rt.fromBuffer(data);
				return rt
					.promisify(
						descriptor.writeValueWithResultAsync,
						descriptor
					)(rtBuffer)
					.then((result: CommunicationResult) => {
						checkCommunicationResult(deviceUuid, result);
						this.emit('valueWrite', deviceUuid, serviceUuid, characteristicUuid, descriptorUuid);
					});
			})
			.catch((ex) => {
				this.emit('valueWrite', deviceUuid, serviceUuid, characteristicUuid, descriptorUuid, ex);
			});
	}

	private _updateRadioState() {
		let state;

		if (!this._radio) {
			state = 'unsupported';
		} else
			switch (this._radio.state) {
				case RadioState.on:
					state = 'poweredOn';
					break;
				case RadioState.off:
					state = 'poweredOff';
					break;
				case RadioState.disabled:
					state = 'poweredOff';
					break;
				default:
					state = 'unknown';
					break;
			}
		if (state != this._radioState) {
			this._radioState = state;
			this.emit('stateChange', state);
		}
	}

	private _onAdvertisementWatcherReceived = (sender: unknown, e: AdvertisementEvent) => {
		const address = formatBluetoothAddress(e.bluetoothAddress);
		const deviceUuid = address.replace(/:/g, '');

		let serviceUuids = undefined;
		const isScanResponse = e.advertisementType === BluetoothLEAdvertisementType.scanResponse;
		if (isScanResponse) {
			if (!this._deviceMap[deviceUuid]) {
				return;
			}
		} else {
			if (!this._allowAdvertisementDuplicates && this._deviceMap[deviceUuid]) {
				return;
			}

			let serviceUuidMatched = !this._filterAdvertisementServiceUuids;
			serviceUuids = rt.toArray(e.advertisement.serviceUuids).map((serviceUuid) => {
				serviceUuid = uuidToString(serviceUuid);
				if (!serviceUuidMatched && this._filterAdvertisementServiceUuids.indexOf(serviceUuid) >= 0) {
					serviceUuidMatched = true;
				}
				return serviceUuid;
			});
			if (!serviceUuidMatched) {
				return;
			}
		}

		let connectable;
		switch (e.advertisementType) {
			case BluetoothLEAdvertisementType.connectableUndirected:
			case BluetoothLEAdvertisementType.connectableDirected:
				connectable = true;
				break;
			case BluetoothLEAdvertisementType.nonConnectableUndirected:
			case BluetoothLEAdvertisementType.scannableUndirected:
				connectable = false;
				break;
			default:
				connectable = undefined;
				break;
		}

		// Random addresses have the two most-significant bits set of the 48-bit address.
		const addressType = e.bluetoothAddress >= 3 * Math.pow(2, 46) ? 'random' : 'public';

		const dataSections = rt.toArray(e.advertisement.dataSections);
		const serviceDataEntry: { uuid?: string; data?: Buffer } = {};
		dataSections.forEach((dataSection) => {
			// https://www.bluetooth.com/specifications/assigned-numbers/generic-access-profile
			switch (dataSection.dataType) {
				case BluetoothLEAdvertisementDataTypes.completeService16BitUuids: {
					const id = Buffer.allocUnsafe(2);
					const buf = rt.toBuffer(dataSection.data);
					id[0] = buf[1];
					id[1] = buf[0];
					serviceDataEntry.uuid = id.toString('hex');
					break;
				}
				case BluetoothLEAdvertisementDataTypes.completeService128BitUuids:
					serviceDataEntry.uuid = rt.toBuffer(dataSection.data).toString('hex');
					break;
				case BluetoothLEAdvertisementDataTypes.serviceData16BitUuids:
					serviceDataEntry.data = rt.toBuffer(dataSection.data).slice(2);
					break;
				default:
					break;
			}
		});

		let txPowerLevel = null;
		const txPowerDataSection = dataSections.find(
			(ds) => ds.dataType === BluetoothLEAdvertisementDataTypes.txPowerLevel
		);
		if (txPowerDataSection) {
			const dataReader = DataReader.fromBuffer(txPowerDataSection.data);
			txPowerLevel = dataReader.readByte();
			if (txPowerLevel >= 128) txPowerLevel -= 256;
			dataReader.close();
		}

		let deviceRecord = this._deviceMap[deviceUuid];
		if (!deviceRecord) {
			deviceRecord = {
				name: null,
				address: e.bluetoothAddress,
				formattedAddress: address,
				addressType: addressType,
				connectable: connectable,
				serviceUuids: serviceUuids,
				txPowerLevel: null,
				device: null,
				serviceMap: {},
				characteristicMap: {},
				descriptorMap: {}
			};
			this._deviceMap[deviceUuid] = deviceRecord;
		}

		// update connectable status!
		if (connectable !== undefined) {
			deviceRecord.connectable = connectable;
		}

		if (e.advertisement.localName) {
			deviceRecord.name = e.advertisement.localName;
		}

		const manufacturerSections = e.advertisement.manufacturerData;
		if (manufacturerSections.size > 0) {
			const manufacturerData = manufacturerSections[0];
			deviceRecord.manufacturerData = rt.toBuffer(manufacturerData.data);
			// const companyIdHex = manufacturerData.companyId.toString(16);
			const toAppend = Buffer.allocUnsafe(2);
			toAppend.writeUInt16LE(manufacturerData.companyId);
			deviceRecord.manufacturerData = Buffer.concat([toAppend, deviceRecord.manufacturerData]);
		}

		if (txPowerLevel) {
			deviceRecord.txPowerLevel = txPowerLevel;
		}

		// If only responding to scan responses, wait until the response to the active query before emitting a 'discover' event.
		if (!this._acceptOnlyScanResponse || isScanResponse) {
			const advertisement = {
				localName: deviceRecord.name,
				txPowerLevel: deviceRecord.txPowerLevel,
				manufacturerData: deviceRecord.manufacturerData, // TODO: manufacturerData
				serviceUuids: deviceRecord.serviceUuids,
				serviceData: serviceDataEntry ? [serviceDataEntry] : []
			};

			const rssi = e.rawSignalStrengthInDBm;

			this.emit(
				'discover',
				deviceUuid,
				address,
				deviceRecord.addressType,
				deviceRecord.connectable,
				advertisement,
				rssi
			);
		}
	};

	private _onAdvertisementWatcherStopped = (sender: any, e: unknown) => {
		if (this._advertisementWatcher.status === BluetoothLEAdvertisementWatcherStatus.aborted) {
			// NO-OP
		} else if (this._advertisementWatcher.status === BluetoothLEAdvertisementWatcherStatus.stopped) {
			// NO-OP
		} else {
			// NO-OP
		}
		this.emit('scanStop');
	};

	private _onConnectionStatusChanged = (sender: any, e: unknown) => {
		const deviceUuid = sender.bluetoothAddress.toString(16);
		const deviceRecord = this._deviceMap[deviceUuid];
		if (deviceRecord) {
			const connectionStatus = sender.connectionStatus;

			if (connectionStatus === BluetoothConnectionStatus.connected) {
				// A 'connect' event was already emitted when the device object was obtained.
				// Windows does not provide an explicit connect API; it will automatically connect
				// whenever an operation is requested on the device that requires a connection.
			} else if (connectionStatus === BluetoothConnectionStatus.disconnected) {
				this.disconnect(deviceUuid);
			}
		}
	};

	private _getCachedServiceAsync(deviceUuid: string, serviceUuid: string) {
		const deviceRecord = this._deviceMap[deviceUuid];
		if (!deviceRecord) {
			throw new Error('Invalid or unknown device UUID: ' + deviceUuid);
		}

		let service = deviceRecord.serviceMap[serviceUuid];
		if (service) {
			return Promise.resolve(service);
		}

		const device = deviceRecord.device;
		if (!device) {
			throw new Error('Device is not connected. UUID: ' + deviceUuid);
		}

		return rt
			.promisify(
				device.getGattServicesAsync,
				device
			)(BluetoothCacheMode.cached)
			.then((result: ServiceCommunicationResult) => {
				checkCommunicationResult(deviceUuid, result);
				service = rt
					.trackDisposables(deviceUuid, rt.toArray(result.services))
					.find((s) => uuidToString(s.uuid) === serviceUuid);
				if (!service) {
					throw new Error('Service ' + serviceUuid + ' not found for device ' + deviceUuid);
				}
				deviceRecord.serviceMap[serviceUuid] = service;
				return service;
			});
	}

	private _getCachedCharacteristicAsync(deviceUuid: string, serviceUuid: string, characteristicUuid: string) {
		const deviceRecord = this._deviceMap[deviceUuid];
		if (!deviceRecord) {
			throw new Error('Invalid or unknown device UUID: ' + deviceUuid);
		}

		const characteristicKey = serviceUuid + '/' + characteristicUuid;
		let characteristic = deviceRecord.characteristicMap[characteristicKey];
		if (characteristic) {
			return Promise.resolve(characteristic);
		}

		return this._getCachedServiceAsync(deviceUuid, serviceUuid).then((service) => {
			return rt
				.promisify(
					service.getCharacteristicsAsync,
					service
				)(BluetoothCacheMode.cached)
				.then((result: CharacteristicCommunicationResult) => {
					checkCommunicationResult(deviceUuid, result);
					characteristic = rt.toArray(result.characteristics).find((c) => uuidToString(c.uuid) === characteristicUuid);
					if (!characteristic) {
						throw new Error(
							'Service ' + serviceUuid + ' characteristic ' + characteristicUuid + ' not found for device ' + deviceUuid
						);
					}
					deviceRecord.characteristicMap[characteristicKey] = characteristic;
					return characteristic;
				});
		});
	}

	private _getCachedDescriptorAsync(
		deviceUuid: string,
		serviceUuid: string,
		characteristicUuid: string,
		descriptorUuid: string
	) {
		const deviceRecord = this._deviceMap[deviceUuid];
		if (!deviceRecord) {
			throw new Error('Invalid or unknown device UUID: ' + deviceUuid);
		}

		const descriptorKey = serviceUuid + '/' + characteristicUuid + '/' + descriptorUuid;
		let descriptor = deviceRecord.descriptorMap[descriptorKey];
		if (descriptor) {
			return Promise.resolve(descriptor);
		}

		return this._getCachedCharacteristicAsync(deviceUuid, serviceUuid, characteristicUuid).then((characteristic) => {
			return rt
				.promisify(
					characteristic.getDescriptorsAsync,
					characteristic
				)(BluetoothCacheMode.cached)
				.then((result: DescriptorCommunicationResult) => {
					checkCommunicationResult(deviceUuid, result);
					descriptor = rt.toArray(result.descriptors).find((d) => uuidToString(d.uuid) === descriptorUuid);
					if (!descriptor) {
						throw new Error(
							'Service ' +
								serviceUuid +
								' characteristic ' +
								characteristicUuid +
								' descriptor ' +
								descriptorUuid +
								' not found for device ' +
								deviceUuid
						);
					}
					deviceRecord.descriptorMap[descriptorKey] = descriptor;
					return descriptor;
				});
		});
	}
}

function formatBluetoothAddress(address: number) {
	if (!address) {
		return 'null';
	}

	let formattedAddress = address.toString(16);
	while (formattedAddress.length < 12) {
		formattedAddress = '0' + formattedAddress;
	}
	formattedAddress =
		formattedAddress.substr(0, 2) +
		':' +
		formattedAddress.substr(2, 2) +
		':' +
		formattedAddress.substr(4, 2) +
		':' +
		formattedAddress.substr(6, 2) +
		':' +
		formattedAddress.substr(8, 2) +
		':' +
		formattedAddress.substr(10, 2);
	return formattedAddress;
}

function characteristicPropertiesToStrings(props: any) {
	const strings = [];

	if (props & GattCharacteristicProperties.broadcast) {
		strings.push('broadcast');
	}

	if (props & GattCharacteristicProperties.read) {
		strings.push('read');
	}

	if (props & GattCharacteristicProperties.writeWithoutResponse) {
		strings.push('writeWithoutResponse');
	}

	if (props & GattCharacteristicProperties.write) {
		strings.push('write');
	}

	if (props & GattCharacteristicProperties.notify) {
		strings.push('notify');
	}

	if (props & GattCharacteristicProperties.indicate) {
		strings.push('indicate');
	}

	if (props & GattCharacteristicProperties.broadcast) {
		strings.push('authenticatedSignedWrites');
	}

	if (props & GattCharacteristicProperties.extendedProperties) {
		strings.push('extendedProperties');
	}

	return strings;
}

/*
function getEnumName(enumType, value) {
	return Object.keys(enumType).find((enumName) => value === enumType[enumName]);
}

function stringToUuid(uuid) {
	if (typeof uuid === 'number') {
		return BluetoothUuidHelper.fromShortId(uuid).replace(/[{}]/g, '');
	} else if (uuid && uuid.length === 4) {
		return BluetoothUuidHelper.fromShortId(parseInt(uuid, 16)).replace(/[{}]/g, '');
	} else {
		return uuid;
	}
}
*/

function addDashesToUuid(i: string) {
	return i.substr(0, 8) + '-' + i.substr(8, 4) + '-' + i.substr(12, 4) + '-' + i.substr(16, 4) + '-' + i.substr(20);
}

function uuidToString(uuid: string) {
	if (!uuid) {
		return uuid;
	}
	uuid = uuid.toString().replace(/[{}]/g, '');
	const shortId = BluetoothUuidHelper.tryGetShortId(uuid);
	if (shortId) {
		return uint32ToHexString(shortId);
	} else {
		return uuid.replace(/-/g, '').toLowerCase();
	}
}

function uint32ToHexString(n: number) {
	return (n + 0x10000).toString(16).substr(-4);
}

function filterUuids(filter: string[]) {
	return (uuid: string) => {
		return !filter || filter.indexOf(uuid) != -1;
	};
}

interface CommunicationResult {
	status: string;
}

function checkCommunicationResult(deviceUuid: string, result: CommunicationResult) {
	if (result.status === GattCommunicationStatus.unreachable) {
		throw new Error('Device unreachable: ' + deviceUuid);
	} else if (result.status === GattCommunicationStatus.protocolError) {
		throw new Error('Protocol error communicating with device: ' + deviceUuid);
	}
}
