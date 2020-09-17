import { BasePeripheral } from '../../Peripheral';

import { AclStream } from './acl-stream';
import { Adapter } from './Adapter';
import { Gatt } from './gatt';
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
		this.handle = handle;

		this.hci = hci;
		this.hci.on('encryptChange', this.onEncryptChange);
		this.hci.on('aclDataPkt', this.onAclDataPkt);

		this.aclStream = new AclStream(hci, handle, hci.addressType, hci.address, this.addressType, this.address);

		this.gatt = new Gatt(this.aclStream);

		this.signaling = new Signaling(this.aclStream);
		this.signaling.on('connectionParameterUpdateRequest', this.onConnectionParameterUpdateRequest);

		const wantedMtu = this.requestedMTU || 256;
		const mtu = await this.gatt.exchangeMtu(wantedMtu);

		this._state = 'connected';
		this._mtu = mtu;
	}

	private onEncryptChange = (handle: number, encrypt: number) => {
		if (handle !== this.handle) {
			return;
		}

		this.aclStream.pushEncrypt(encrypt);
	};

	private onAclDataPkt = (handle: number, cid: number, data: Buffer) => {
		if (handle !== this.handle) {
			return;
		}

		this.aclStream.push(cid, data);
	};

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
		this.handle = null;

		this.aclStream.push(null, null);
		this.aclStream = null;
		this.gatt = null;
		this.signaling.removeAllListeners();
		this.signaling = null;

		this.hci.off('encryptChange', this.onEncryptChange);
		this.hci.off('aclDataPkt', this.onAclDataPkt);
		this.hci = null;
	}

	public async discoverServices(serviceUUIDs?: string[]): Promise<Service[]> {
		const services = await this.gatt.discoverServices(serviceUUIDs || []);
		for (const rawService of services) {
			let service = this.services.get(rawService.uuid);
			if (!service) {
				service = new Service(this.noble, this, rawService.uuid, this.gatt);
				this.services.set(rawService.uuid, service);
			}
		}
		return [...this.services.values()];
	}

	public async discoverIncludedServices(baseService: Service, serviceUUIDs?: string[]) {
		const services = await this.gatt.discoverIncludedServices(baseService.uuid, serviceUUIDs);
		for (const rawService of services) {
			let service = this.services.get(rawService.uuid);
			if (!service) {
				service = new Service(this.noble, this, rawService.uuid, this.gatt);
				this.services.set(rawService.uuid, service);
			}
		}
		return [...this.services.values()];
	}
}
