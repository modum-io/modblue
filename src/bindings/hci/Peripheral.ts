import { Peripheral, Service } from '../../models';

import { HciAdapter } from './Adapter';
import { Gatt } from './gatt';
import { Hci } from './hci';
import { HciNoble } from './Noble';
import { HciService } from './Service';
import { Signaling } from './signaling';

export class HciPeripheral extends Peripheral<HciNoble, HciAdapter> {
	private hci: Hci;
	private handle: number;
	private gatt: Gatt;
	private signaling: Signaling;
	private requestedMTU: number;

	private services: Map<string, Service> = new Map();

	public async connect(requestMtu?: number): Promise<void> {
		this._state = 'connecting';
		this.requestedMTU = requestMtu;
		await this.adapter.connect(this);
	}
	public async onConnect(hci: Hci, handle: number) {
		this.handle = handle;

		this.hci = hci;
		this.gatt = new Gatt(this.hci, this.handle);
		this.signaling = new Signaling(this.hci, this.handle);

		const wantedMtu = this.requestedMTU || 256;
		const mtu = await this.gatt.exchangeMtu(wantedMtu);

		this._state = 'connected';
		this._mtu = mtu;
	}

	public async disconnect(): Promise<void> {
		this._state = 'disconnecting';
		await this.adapter.disconnect(this);
	}
	public async onDisconnect() {
		if (this.gatt) {
			this.gatt.dispose();
			this.gatt = null;
		}

		if (this.signaling) {
			this.signaling.dispose();
			this.signaling = null;
		}

		this.hci = null;

		this.handle = null;
		this._state = 'disconnected';
		this._mtu = undefined;

		this.services = new Map();
	}

	public getDiscoveredServices(): Service[] {
		return [...this.services.values()];
	}

	public async discoverServices(serviceUUIDs?: string[]): Promise<Service[]> {
		const services = await this.gatt.discoverServices(serviceUUIDs || []);
		for (const rawService of services) {
			let service = this.services.get(rawService.uuid);
			if (!service) {
				service = new HciService(this.noble, this, rawService.uuid, this.gatt);
				this.services.set(rawService.uuid, service);
			}
		}
		return [...this.services.values()];
	}

	public async discoverIncludedServices(baseService: Service, serviceUUIDs?: string[]): Promise<Service[]> {
		const services = await this.gatt.discoverIncludedServices(baseService.uuid, serviceUUIDs);
		for (const rawService of services) {
			let service = this.services.get(rawService.uuid);
			if (!service) {
				service = new HciService(this.noble, this, rawService.uuid, this.gatt);
				this.services.set(rawService.uuid, service);
			}
		}
		return [...this.services.values()];
	}
}
