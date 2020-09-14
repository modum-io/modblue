import { EventEmitter } from 'events';

import { Noble } from './Noble';
import { Service } from './Service';

export class Peripheral extends EventEmitter {
	private noble: Noble;

	public readonly uuid: string;
	public state: string;
	public address: string;
	public addressType: string;
	public connectable: boolean;
	public advertisement: any;
	public rssi: number;
	public mtu: number;

	public services: Map<string, Service>;

	public constructor(
		noble: Noble,
		uuid: string,
		address: string,
		addressType: string,
		connectable: boolean,
		advertisement: any,
		rssi: number
	) {
		super();

		this.noble = noble;

		this.uuid = uuid;
		this.address = address;
		this.addressType = addressType;
		this.connectable = connectable;
		this.advertisement = advertisement;
		this.rssi = rssi;
		this.services = new Map();
		this.mtu = null;
		this.state = 'disconnected';
	}

	public toString() {
		return JSON.stringify({
			uuid: this.uuid,
			address: this.address,
			addressType: this.addressType,
			connectable: this.connectable,
			advertisement: this.advertisement,
			rssi: this.rssi,
			mtu: this.mtu,
			state: this.state
		});
	}

	public async connect(requestMtu?: number) {
		if (this.state === 'connected') {
			this.emit('connect');
		} else {
			this.state = 'connecting';
			this.noble.connect(this.uuid, requestMtu);
		}

		return new Promise<void>((resolve, reject) => this.once('connect', (error) => (error ? reject(error) : resolve())));
	}

	public async disconnect() {
		this.state = 'disconnecting';
		this.noble.disconnect(this.uuid);
		return new Promise<string>((resolve) => this.once('disconnect', (reason) => resolve(reason)));
	}

	public async updateRSSI() {
		this.noble.updateRSSI(this.uuid);
		return new Promise<number>((resolve) => this.once('rssiUpdate', (rssi) => resolve(rssi)));
	}

	public async discoverServices(uuids: string[]) {
		this.noble.discoverServices(this.uuid, uuids);
		return new Promise<any[]>((resolve) => this.once('servicesDiscover', (services) => resolve(services)));
	}

	public async discoverSomeServicesAndCharacteristics(serviceUUIDs: string[], characteristicsUUIDs: string[]) {
		const services = await this.discoverServices(serviceUUIDs);

		if (services.length < serviceUUIDs.length) {
			throw new Error('Could not find all requested services');
		}

		let allCharacteristics: any[] = [];

		for (const service of services) {
			try {
				const characteristics = await service.discoverCharacteristics(characteristicsUUIDs);
				allCharacteristics = allCharacteristics.concat(characteristics);
			} catch {
				// The characteristics might be inside another service
				// TODO: Handle not finding all characteristics
			}
		}

		return allCharacteristics;
	}

	public async discoverAllServicesAndCharacteristics() {
		await this.discoverSomeServicesAndCharacteristics([], []);
	}

	public async readHandle(handle: number) {
		this.noble.readHandle(this.uuid, handle);
		return new Promise<Buffer>((resolve) => this.once(`handleRead${handle}`, (data) => resolve(data)));
	}

	public async writeHandle(handle: number, data: Buffer, withoutResponse: boolean) {
		this.noble.writeHandle(this.uuid, handle, data, withoutResponse);
		return new Promise<void>((resolve) => this.once(`handleWrite${handle}`, () => resolve()));
	}
}
