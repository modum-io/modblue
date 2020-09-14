import { EventEmitter } from 'events';

import { Noble } from './Noble';

const knownDescriptors = require('./data/descriptors.json');

export class Descriptor extends EventEmitter {
	private noble: Noble;
	private peripheralUUID: string;
	private serviceUUID: string;
	private characteristicUUID: string;

	public readonly uuid: string;
	public readonly name: string;
	public readonly type: string;

	public constructor(
		noble: Noble,
		peripheralUUID: string,
		serviceUUID: string,
		characteristicUUID: string,
		uuid: string
	) {
		super();

		this.noble = noble;
		this.peripheralUUID = peripheralUUID;
		this.serviceUUID = serviceUUID;
		this.characteristicUUID = characteristicUUID;

		this.uuid = uuid;
		this.name = null;
		this.type = null;

		const descriptor = knownDescriptors[uuid];
		if (descriptor) {
			this.name = descriptor.name;
			this.type = descriptor.type;
		}
	}

	public toString() {
		return JSON.stringify({
			uuid: this.uuid,
			name: this.name,
			type: this.type
		});
	}

	public async readValue() {
		this.noble.readValue(this.peripheralUUID, this.serviceUUID, this.characteristicUUID, this.uuid);
		return new Promise<Buffer>((resolve) => this.once('valueRead', (data) => resolve(data)));
	}

	public async writeValue(data: Buffer) {
		this.noble.writeValue(this.peripheralUUID, this.serviceUUID, this.characteristicUUID, this.uuid, data);
		return new Promise<void>((resolve) => this.once('valueWrite', () => resolve()));
	}
}
