import { EventEmitter } from 'events';

import knownCharacteristics from './data/characteristics.json';
import { Descriptor } from './Descriptor';
import { Noble } from './Noble';

type KnownCharacteristics = { [uuid: string]: { name: string; type: string } };

export class Characteristic extends EventEmitter {
	private noble: Noble;
	private peripheralUUID: string;
	private serviceUUID: string;

	public readonly uuid: string;
	public readonly name: string;
	public readonly type: string;

	public properties: any;
	public descriptors: Map<string, Descriptor>;

	public constructor(noble: Noble, peripheralUUID: string, serviceUUID: string, uuid: string, properties: any) {
		super();

		this.noble = noble;
		this.peripheralUUID = peripheralUUID;
		this.serviceUUID = serviceUUID;

		this.uuid = uuid;
		this.name = null;
		this.type = null;

		this.properties = properties;
		this.descriptors = new Map();

		const characteristic = (knownCharacteristics as KnownCharacteristics)[uuid];
		if (characteristic) {
			this.name = characteristic.name;
			this.type = characteristic.type;
		}
	}

	public toString() {
		return JSON.stringify({
			uuid: this.uuid,
			name: this.name,
			type: this.type,
			properties: this.properties
		});
	}

	public async read() {
		this.noble.read(this.peripheralUUID, this.serviceUUID, this.uuid);
		return new Promise<Buffer>((resolve) => {
			const onRead = (data: Buffer, isNotification: boolean) => {
				// only call the callback if 'read' event and non-notification
				// 'read' for non-notifications is only present for backwards compatbility
				if (!isNotification) {
					// remove the listener
					this.removeListener('read', onRead);
					resolve(data);
				}
			};

			this.on('read', onRead);
		});
	}

	public async write(data: Buffer, withoutResponse: boolean) {
		this.noble.write(this.peripheralUUID, this.serviceUUID, this.uuid, data, withoutResponse);
		return new Promise<void>((resolve) => this.once('write', () => resolve()));
	}

	public async broadcast(broadcast: any) {
		this.noble.broadcast(this.peripheralUUID, this.serviceUUID, this.uuid, broadcast);
		return new Promise<void>((resolve) => this.once('broadcast', () => resolve()));
	}

	// deprecated in favour of subscribe/unsubscribe
	public async notify(notify: boolean) {
		this.noble.notify(this.peripheralUUID, this.serviceUUID, this.uuid, notify);
		return new Promise<void>((resolve) => this.once('notify', () => resolve()));
	}

	public async subscribe() {
		await this.notify(true);
	}

	public async unsubscribe() {
		await this.notify(false);
	}

	public async discoverDescriptors() {
		this.noble.discoverDescriptors(this.peripheralUUID, this.serviceUUID, this.uuid);
		return new Promise<any[]>((resolve) => this.once('descriptorsDiscover', (descriptors) => resolve(descriptors)));
	}
}
