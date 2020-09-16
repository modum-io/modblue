import { BasePeripheral } from '../../Peripheral';

import { AclStream } from './acl-stream';
import { Adapter } from './Adapter';
import { Gatt, GattService } from './gatt';
import { Noble } from './Noble';
import { Service } from './Service';
import { Signaling } from './signaling';

export class Peripheral extends BasePeripheral<Noble, Adapter> {
	private aclStream: AclStream;
	private gatt: Gatt;
	private signaling: Signaling;

	private services: Map<string, Service> = new Map();

	public async connect(requestMtu?: number): Promise<void> {
		this._state = 'connecting';
		this._mtu = requestMtu;
		await this.adapter.connect(this, requestMtu);
	}
	public onConnect(aclStream: AclStream, gatt: Gatt, signaling: Signaling) {
		this._state = 'connected';
		this.aclStream = aclStream;
		this.gatt = gatt;
		this.signaling = signaling;

		gatt.on('mtu', this.onMtu);
	}

	private onMtu = (mtu: number) => {
		this._mtu = mtu;
	};

	public async disconnect(): Promise<number> {
		this._state = 'disconnecting';
		return this.adapter.disconnect(this);
	}
	public onDisconnect() {
		this._state = 'disconnected';
		this.aclStream.push(null, null);
		this.gatt.removeAllListeners();
		this.signaling.removeAllListeners();
	}

	public async discoverServices(serviceUUIDs: string[]): Promise<Service[]> {
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
