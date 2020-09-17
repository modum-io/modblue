import { BasePeripheral } from '../../Peripheral';

import { AclStream } from './acl-stream';
import { Adapter } from './Adapter';
import { Gatt, GattService } from './gatt';
import { Hci } from './hci';
import { Noble } from './Noble';
import { Service } from './Service';
import { Signaling } from './signaling';

export class Peripheral extends BasePeripheral<Noble, Adapter> {
	private hci: Hci;
	private handle: number;
	private aclStream: AclStream;
	private gatt: Gatt;
	private signaling: Signaling;
	private requestedMTU: number;

	public getACLStream() {
		return this.aclStream;
	}

	private services: Map<string, Service> = new Map();
	public getDiscoveredServices() {
		return [...this.services.values()];
	}

	public async connect(requestMtu?: number): Promise<void> {
		this._state = 'connecting';
		this.requestedMTU = requestMtu;
		await this.adapter.connect(this);
	}
	public async onConnect(hci: Hci, handle: number) {
		this.hci = hci;
		this.handle = handle;
		this.aclStream = new AclStream(hci, handle, hci.addressType, hci.address, this.addressType, this.address);
		this.gatt = new Gatt(this.aclStream);
		this.signaling = new Signaling(handle, this.aclStream);
		this.signaling.on('connectionParameterUpdateRequest', this.onConnectionParameterUpdateRequest);

		const wantedMtu = this.requestedMTU || 256;
		const mtu = await this.gatt.exchangeMtu(wantedMtu);

		this._state = 'connected';
		this._mtu = mtu;
	}

	private onConnectionParameterUpdateRequest = (
		minInterval: number,
		maxInterval: number,
		latency: number,
		supervisionTimeout: number
	) => {
		this.hci.connUpdateLe(this.handle, minInterval, maxInterval, latency, supervisionTimeout);
	};

	public async disconnect(): Promise<number> {
		this._state = 'disconnecting';
		return this.adapter.disconnect(this);
	}
	public onDisconnect() {
		this._state = 'disconnected';
		this._mtu = undefined;

		this.aclStream.push(null, null);
		this.gatt.removeAllListeners();
		this.signaling.removeAllListeners();
	}

	public async discoverServices(serviceUUIDs?: string[]): Promise<Service[]> {
		return new Promise<Service[]>((resolve) => {
			const done = (services: GattService[]) => {
				this.gatt.off('servicesDiscovered', done);

				for (const rawService of services) {
					let service = this.services.get(rawService.uuid);
					if (!service) {
						service = new Service(this.noble, this, rawService.uuid, this.gatt);
						this.services.set(rawService.uuid, service);
					}
				}

				resolve([...this.services.values()]);
			};

			this.gatt.on('servicesDiscovered', done);

			this.gatt.discoverServices(serviceUUIDs || []);
		});
	}

	public async discoverIncludedServices(baseService: Service, serviceUUIDs?: string[]) {
		return new Promise<Service[]>((resolve) => {
			const done = (serviceUUID: string, services: GattService[]) => {
				if (serviceUUID !== this.uuid) {
					// This isn't our service, ignore
					return;
				}

				this.gatt.off('includedServicesDiscovered', done);

				for (const rawService of services) {
					let service = this.services.get(rawService.uuid);
					if (!service) {
						service = new Service(this.noble, this, rawService.uuid, this.gatt);
						this.services.set(rawService.uuid, service);
					}
				}

				resolve([...this.services.values()]);
			};

			this.gatt.on('includedServicesDiscovered', done);

			this.gatt.discoverIncludedServices(baseService.uuid, serviceUUIDs || []);
		});
	}
}
