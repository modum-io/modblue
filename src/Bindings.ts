import { EventEmitter } from 'events';

export type AddressType = 'public' | 'random';

export interface Device {
	id: number;
	address: string;
}

export interface GattService {
	uuid: string;
	startHandle: number;
	endHandle: number;
}

export interface GattCharacteristic {
	uuid: string;
	startHandle: number;
	endHandle?: number;
	propertiesFlags: number;
	properties: string[];
	valueHandle: number;
}

export interface GattDescriptor {
	uuid: string;
	handle: number;
}

export declare interface NobleBindings {
	on(event: 'stateChange', listener: (state: string) => void): this;
	on(event: 'addressChange', listener: (address: string) => void): this;
	on(event: 'scanStart', listener: (filterDuplicates: boolean) => void): this;
	on(event: 'scanStop', listener: () => void): this;

	on(
		event: 'discover',
		listener: (
			uuid: string,
			address: string,
			addressType: AddressType,
			connectable: boolean,
			advertisement: any,
			rssi: number
		) => void
	): this;
	on(event: 'rssi', listener: (uuid: string, rssi: number) => void): this;

	on(event: 'connect', listener: (uuid: string, error: Error) => void): this;
	on(event: 'disconnect', listener: (uuid: string, reason: number) => void): this;

	on(event: 'mtu', listener: (uuid: string, mtu: number) => void): this;
	on(event: 'servicesDiscover', listener: (uuid: string, discoveredServices: GattService[]) => void): this;
	on(event: 'servicesDiscovered', listener: (uuid: string, services: GattService[]) => void): this;
	on(
		event: 'includedServicesDiscover',
		listener: (uuid: string, serviceUUID: string, includedServiceUUIDs: string[]) => void
	): this;
	on(
		event: 'characteristicsDiscover',
		listener: (uuid: string, serviceUUID: string, discoveredCharacteristics: GattCharacteristic[]) => void
	): this;
	on(
		event: 'characteristicsDiscovered',
		listener: (uuid: string, serviceUUID: string, characteristics: GattCharacteristic[]) => void
	): this;
	on(
		event: 'read',
		listener: (uuid: string, serviceUUID: string, characteristicUUID: string, data: Buffer) => void
	): this;
	on(event: 'write', listener: (uuid: string, serviceUUID: string, characteristicUUID: string) => void): this;
	on(
		event: 'broadcast',
		listener: (uuid: string, serviceUUID: string, characteristicUUID: string, broadcast: boolean) => void
	): this;
	on(
		event: 'notify',
		listener: (uuid: string, serviceUUID: string, characteristicUUID: string, notify: boolean) => void
	): this;
	on(
		event: 'notification',
		listener: (uuid: string, serviceUUID: string, characteristicUUID: string, valueData: Buffer) => void
	): this;
	on(
		event: 'descriptorsDiscover',
		listener: (
			uuid: string,
			serviceUUID: string,
			characteristicUUID: string,
			discoveredDescriptors: GattDescriptor[]
		) => void
	): this;
	on(
		event: 'descriptorsDiscovered',
		listener: (uuid: string, serviceUUID: string, characteristicUUID: string, descriptors: GattDescriptor[]) => void
	): this;
	on(
		event: 'valueRead',
		listener: (
			uuid: string,
			serviceUUID: string,
			characteristicUUID: string,
			descriptorUUID: string,
			data: Buffer
		) => void
	): this;
	on(
		event: 'valueWrite',
		listener: (uuid: string, serviceUUID: string, characteristicUUID: string, descriptorUUID: string) => void
	): this;
	on(event: 'handleRead', listener: (uuid: string, handle: number, data: Buffer) => void): this;
	on(event: 'handleWrite', listener: (uuid: string, handle: number) => void): this;
	on(event: 'handleNotify', listener: (uuid: string, valueHandle: number, valueData: Buffer) => void): this;

	emit(event: 'stateChange', state: string): boolean;
	emit(event: 'addressChange', address: string): boolean;
	emit(event: 'scanStart', filterDuplicates: boolean): boolean;
	emit(event: 'scanStop'): boolean;

	emit(
		event: 'discover',
		uuid: string,
		address: string,
		addressType: AddressType,
		connectable: boolean,
		advertisement: any,
		rssi: number
	): boolean;
	emit(event: 'rssi', uuid: string, rssi: number): this;

	emit(event: 'connect', uuid: string, error: Error): boolean;
	emit(event: 'disconnect', uuid: string, reason: number): boolean;

	emit(event: 'mtu', uuid: string, mtu: number): boolean;
	emit(event: 'servicesDiscover', uuid: string, discoveredServices: GattService[]): boolean;
	emit(event: 'servicesDiscovered', uuid: string, services: GattService[]): boolean;
	emit(event: 'includedServicesDiscover', uuid: string, serviceUUID: string, includedServiceUUIDs: string[]): boolean;
	emit(
		event: 'characteristicsDiscover',
		uuid: string,
		serviceUUID: string,
		discoveredCharacteristics: GattCharacteristic[]
	): boolean;
	emit(
		event: 'characteristicsDiscovered',
		uuid: string,
		serviceUUID: string,
		characteristics: GattCharacteristic[]
	): boolean;
	emit(event: 'read', uuid: string, serviceUUID: string, characteristicUUID: string, data: Buffer): boolean;
	emit(event: 'write', uuid: string, serviceUUID: string, characteristicUUID: string): boolean;
	emit(event: 'broadcast', uuid: string, serviceUUID: string, characteristicUUID: string, broadcast: boolean): boolean;
	emit(event: 'notify', uuid: string, serviceUUID: string, characteristicUUID: string, notify: boolean): boolean;
	emit(
		event: 'notification',
		uuid: string,
		serviceUUID: string,
		characteristicUUID: string,
		valueData: Buffer
	): boolean;
	emit(
		event: 'descriptorsDiscover',
		uuid: string,
		serviceUUID: string,
		characteristicUUID: string,
		discoveredDescriptors: GattDescriptor[]
	): boolean;
	emit(
		event: 'descriptorsDiscovered',
		uuid: string,
		serviceUUID: string,
		characteristicUUID: string,
		descriptors: GattDescriptor[]
	): boolean;
	emit(
		event: 'valueRead',
		uuid: string,
		serviceUUID: string,
		characteristicUUID: string,
		descriptorUUID: string,
		data: Buffer
	): boolean;
	emit(
		event: 'valueWrite',
		uuid: string,
		serviceUUID: string,
		characteristicUUID: string,
		descriptorUUID: string
	): boolean;
	emit(event: 'handleRead', uuid: string, handle: number, data: Buffer): boolean;
	emit(event: 'handleWrite', uuid: string, handle: number): boolean;
	emit(event: 'handleNotify', uuid: string, valueHandle: number, valueData: Buffer): boolean;
}

export abstract class NobleBindings extends EventEmitter {
	public abstract getDevices(): Device[];
	public abstract init(deviceId?: number): void;

	public abstract startScanning(serviceUUIDs: string[], allowDuplicates: boolean): void;
	public abstract stopScanning(): void;

	public abstract connect(peripheralUUID: string, requestMtu?: number): void;
	public abstract disconnect(peripheralUUID: string): void;

	public abstract updateRssi(peripheralUUID: string): void;

	public abstract discoverServices(peripheralUUID: string, uuids: string[]): void;
	public abstract discoverIncludedServices(peripheralUUID: string, serviceUUID: string, serviceUUIDs: string[]): void;
	public abstract discoverCharacteristics(
		peripheralUUID: string,
		serviceUUID: string,
		characteristicUUIDs: string[]
	): void;

	public abstract read(peripheralUUID: string, serviceUUID: string, characteristicUUID: string): void;
	public abstract write(
		peripheralUUID: string,
		serviceUUID: string,
		characteristicUUID: string,
		data: Buffer,
		withoutResponse: boolean
	): void;
	public abstract broadcast(
		peripheralUUID: string,
		serviceUUID: string,
		characteristicUUID: string,
		broadcast: boolean
	): void;
	public abstract notify(
		peripheralUUID: string,
		serviceUUID: string,
		characteristicUUID: string,
		notify: boolean
	): void;

	public abstract discoverDescriptors(peripheralUUID: string, serviceUUID: string, characteristicUUID: string): void;

	public abstract readValue(
		peripheralUUID: string,
		serviceUUID: string,
		characteristicUUID: string,
		descriptorUUID: string
	): void;
	public abstract writeValue(
		peripheralUUID: string,
		serviceUUID: string,
		characteristicUUID: string,
		descriptorUUID: string,
		data: Buffer
	): void;

	public abstract readHandle(peripheralUUID: string, attHandle: number): void;

	public abstract writeHandle(peripheralUUID: string, attHandle: number, data: Buffer, withoutResponse: boolean): void;
}
